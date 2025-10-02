"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import styles from "@/styles/NightSky.module.css";

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const createObjectKey = (userId: string) => {
  const fallback = Math.random().toString(36).slice(2);
  const basePath = `entries/${userId}`;

  try {
    return `${basePath}/${Date.now()}-${crypto.randomUUID()}.webm`;
  } catch {
    return `${basePath}/${Date.now()}-${fallback}.webm`;
  }
};

type RecordButtonProps = {
  onEntryCreated?: (entryId: string) => void;
};

const RecordButton = ({ onEntryCreated }: RecordButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const launchTimerRef = useRef<number | null>(null);

  const clearLaunchTimer = () => {
    if (launchTimerRef.current) {
      window.clearTimeout(launchTimerRef.current);
      launchTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearLaunchTimer();
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  const resetRecorder = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
    setIsRecording(false);
  };

  const handleStop = useCallback(async () => {
    setIsRecording(false);
    setIsUploading(true);

    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });

    resetRecorder();

    if (blob.size === 0) {
      setIsUploading(false);
      setError("조금 더 길게 이야기해 주세요.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("로그인 정보를 찾을 수 없습니다.");
        setIsUploading(false);
        return;
      }

      const storagePath = createObjectKey(userId);
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, blob, { contentType: blob.type });

      const x = Number(randomBetween(10, 90).toFixed(2));
      const y = Number(randomBetween(20, 80).toFixed(2));

      const entry = await addDoc(collection(db, "users", userId, "record_note"), {
        storagePath,
        createdAt: serverTimestamp(),
        x,
        y,
      });

      onEntryCreated?.(entry.id);
      setError(null);
      setLaunching(true);
      clearLaunchTimer();
      launchTimerRef.current = window.setTimeout(() => {
        setLaunching(false);
        launchTimerRef.current = null;
      }, 1400);
    } catch (uploadError) {
      console.error("Failed to save audio entry", uploadError);
      setError("별을 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
      chunksRef.current = [];
    }
  }, [onEntryCreated]);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저에서는 녹음을 지원하지 않아요.");
      setPermissionDenied(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        void handleStop();
      });

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setPermissionDenied(false);
    } catch (requestError) {
      console.error("Microphone permission or availability issue", requestError);
      
      // NotAllowedError는 사용자가 권한을 거부했거나 브라우저 정책에 의해 차단됨
      if (requestError instanceof Error && requestError.name === "NotAllowedError") {
        setPermissionDenied(true);
        setError("마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요.");
      } else {
        setError("마이크 접근 중 오류가 발생했습니다. 다시 시도해 주세요.");
        setPermissionDenied(false);
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      return;
    }
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const handleToggle = async () => {
    if (isUploading) {
      return;
    }

    if (!isRecording) {
      if (!auth.currentUser) {
        setError("로그인 후에 별을 만들 수 있어요.");
        return;
      }

      await startRecording();
      return;
    }

    stopRecording();
  };

  const buttonClassName = [
    styles.recordButton,
    isRecording ? styles.recordButtonRecording : "",
    isUploading ? styles.recordButtonUploading : "",
    launching ? styles.recordButtonLaunching : "",
  ]
    .filter(Boolean)
    .join(" ");

  const statusMessage = launching
    ? "새로운 별이 밤하늘에 떠올랐어요!"
    : isUploading
      ? "새로운 별을 띄우는 중..."
      : isRecording
        ? "녹음 중... 다시 누르면 별이 만들어져요"
        : permissionDenied
          ? "마이크 권한을 허용해야 별을 만들 수 있어요"
          : "별을 만들려면 별 아이콘을 눌러 이야기해 주세요";

  const getPermissionInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes("chrome") || userAgent.includes("edge")) {
      return "Chrome/Edge: 주소창 왼쪽의 🔒 아이콘 → 사이트 설정 → 마이크를 '허용'으로 변경하고 페이지를 새로고침하세요.";
    } else if (userAgent.includes("firefox")) {
      return "Firefox: 주소창 왼쪽의 🔒 아이콘 → 권한 → 마이크를 '허용'으로 변경하고 페이지를 새로고침하세요.";
    } else if (userAgent.includes("safari")) {
      return "Safari: 상단 메뉴 Safari → 설정 → 웹사이트 → 마이크에서 이 사이트를 '허용'으로 변경하고 페이지를 새로고침하세요.";
    }
    
    return "브라우저 설정에서 이 사이트의 마이크 권한을 허용하고 페이지를 새로고침하세요.";
  };

  return (
    <div className={styles.recordWrapper}>
      <button
        type="button"
        className={buttonClassName}
        aria-live="polite"
        aria-pressed={isRecording}
        onClick={handleToggle}
        disabled={isUploading}
      >
        <svg
          className={styles.recordIcon}
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M60 5l15.45 34.85L113 45l-27 24.5L91 115 60 93 29 115l5-45.5L7 45l37.55-5.15z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">음성 일기 녹음 버튼</span>
      </button>
      <p className={styles.recordStatus} aria-live="polite">
        {statusMessage}
      </p>
      {error ? (
        <div>
          <p className={styles.recordError} role="alert">
            {error}
          </p>
          {permissionDenied && (
            <p className={styles.recordHint}>
              {getPermissionInstructions()}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default RecordButton;
