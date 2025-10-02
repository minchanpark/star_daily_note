import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const fallbackConfig: FirebaseOptions & { measurementId?: string } = {
  apiKey: "AIzaSyCfCTRZSU5S9yIhDL0gA-klEsxBygwoLtw",
  authDomain: "star-daily-note.firebaseapp.com",
  projectId: "star-daily-note",
  storageBucket: "star-daily-note.firebasestorage.app",
  messagingSenderId: "553095837817",
  appId: "1:553095837817:web:789336ac085b0620a5bca8",
  measurementId: "G-RKXEW9C92H",
};

const createFirebaseConfig = (): FirebaseOptions & { measurementId?: string } => {
  const requiredKeys: Array<keyof typeof firebaseEnv> = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missing = requiredKeys.filter((key) => !firebaseEnv[key]);

  if (missing.length === 0) {
    return {
      apiKey: firebaseEnv.apiKey!,
      authDomain: firebaseEnv.authDomain!,
      projectId: firebaseEnv.projectId!,
      storageBucket: firebaseEnv.storageBucket!,
      messagingSenderId: firebaseEnv.messagingSenderId!,
      appId: firebaseEnv.appId!,
      measurementId: firebaseEnv.measurementId ?? undefined,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `Falling back to embedded Firebase config because environment variables are missing: ${missing.join(", ")}`,
    );
  }

  return fallbackConfig;
};

const firebaseConfig = createFirebaseConfig();

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

let analyticsInstance: Analytics | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (!analyticsInitPromise) {
    analyticsInitPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .then((instance) => {
        analyticsInstance = instance;
        return instance;
      })
      .catch(() => null);
  }

  return analyticsInitPromise;
};
