"use client";

import { useEffect, useRef, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  if (typeof data.audioUrl !== "string" || data.audioUrl.length === 0) {
    return null;
  }

  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

  const { x, y } = typeof data.x === "number" && typeof data.y === "number"
    ? { x: data.x, y: data.y }
    : createFallbackPosition(doc.id);

  return {
    id: doc.id,
    audioUrl: data.audioUrl,
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleStarSelect = (entry: StarEntry) => {
    if (activeId === entry.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setActiveId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(entry.audioUrl);
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setActiveId((current) => (current === entry.id ? null : current));
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    });

    audio.play().then(() => {
      setActiveId(entry.id);
    }).catch((error) => {
      console.error("Audio playback failed", error);
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
      setActiveId(null);
    });
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
            isActive={entry.id === activeId}
            isHighlighted={entry.id === highlightedId}
            onSelect={handleStarSelect}
          />
        ))}
      </div>

      <div className={styles.controlPanel}>
        <RecordButton onEntryCreated={handleEntryCreated} />
      </div>
    </div>
  );
};

export default NightSky;
