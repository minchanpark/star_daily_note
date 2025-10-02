"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import RecordButton from "@/components/RecordButton";
import UserMenu from "@/components/UserMenu";
import Star, { type StarEntry } from "@/components/Star";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/NightSky.module.css";

const USERS_COLLECTION = "users";
const RECORD_NOTE_SUBCOLLECTION = "record_note";

const createFallbackPosition = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const normalized = Math.abs(hash);
  const percentage = (offset: number, span: number) => (((normalized >> offset) & 0xff) / 255) * span;

  return {
    x: 10 + percentage(2, 80),
    y: 20 + percentage(5, 60),
  };
};

const mapSnapshotToEntry = (
  doc: QueryDocumentSnapshot,
): StarEntry | null => {
  const data = doc.data();
  if (typeof data.storagePath !== "string" || data.storagePath.length === 0) {
    return null;
  }

  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

  const { x, y } = typeof data.x === "number" && typeof data.y === "number"
    ? { x: data.x, y: data.y }
    : createFallbackPosition(doc.id);

  return {
    id: doc.id,
    storagePath: data.storagePath,
    createdAt,
    x,
    y,
  };
};

const NightSky = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<StarEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlCacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      return undefined;
    }

    const entriesRef = collection(db, USERS_COLLECTION, user.uid, RECORD_NOTE_SUBCOLLECTION);
    const entriesQuery = query(entriesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      const nextEntries = snapshot.docs
        .map(mapSnapshotToEntry)
        .filter((entry): entry is StarEntry => Boolean(entry));

      setEntries(nextEntries);
    });

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!pendingHighlightId) {
      return;
    }

    const nextEntry = entries.find((entry) => entry.id === pendingHighlightId);
    if (!nextEntry) {
      return;
    }

    setHighlightedId(nextEntry.id);
    setPendingHighlightId(null);

    const timeoutId = window.setTimeout(() => {
      setHighlightedId((current) => (current === nextEntry.id ? null : current));
    }, 3600);

    return () => window.clearTimeout(timeoutId);
  }, [entries, pendingHighlightId]);

  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const playEntry = useCallback(async (entry: StarEntry) => {
    if (activeId === entry.id) {
      stopCurrentAudio();
      setActiveId(null);
      return;
    }

    stopCurrentAudio();
    setPlaybackError(null);
    setLoadingId(entry.id);

    let audio: HTMLAudioElement | null = null;

    try {
      let audioUrl = urlCacheRef.current.get(entry.id);
      if (!audioUrl) {
        audioUrl = await getDownloadURL(ref(storage, entry.storagePath));
        urlCacheRef.current.set(entry.id, audioUrl);
      }

      audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        setActiveId((current) => (current === entry.id ? null : current));
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      });

      await audio.play();
      setActiveId(entry.id);
    } catch (error) {
      console.error("Audio playback failed", error);
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      setActiveId(null);
      setPlaybackError("별의 음성을 재생할 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoadingId((current) => (current === entry.id ? null : current));
    }
  }, [activeId, stopCurrentAudio]);

  const handleStarSelect = (entry: StarEntry) => {
    void playEntry(entry);
  };

  const handleEntryCreated = (entryId: string) => {
    setPendingHighlightId(entryId);
  };

  const skyClassName = `${styles.sky} ${styles.sparkle}`;

  return (
    <div className={styles.container}>
      <UserMenu />
      
      <div className={styles.skyLayers}>
        <div className={styles.layer} />
        <div className={styles.layerSoft} />
        <div className={styles.layerGradient} />
      </div>

      <div className={skyClassName}>
        {entries.map((entry) => (
          <Star
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeId || entry.id === loadingId}
            isHighlighted={entry.id === highlightedId}
            onSelect={handleStarSelect}
          />
        ))}
      </div>

      <div className={styles.controlPanel}>
        <RecordButton onEntryCreated={handleEntryCreated} />
      </div>

      {playbackError ? (
        <div className={styles.playbackError} role="alert">
          {playbackError}
        </div>
      ) : null}
    </div>
  );
};

export default NightSky;
