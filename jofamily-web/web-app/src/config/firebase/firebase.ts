import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

function assertFirebaseConfig() {
  const required: Array<{ key: keyof typeof firebaseConfig; envVar: string }> = [
    { key: 'apiKey', envVar: 'VITE_FIREBASE_API_KEY' },
    { key: 'authDomain', envVar: 'VITE_FIREBASE_AUTH_DOMAIN' },
    { key: 'projectId', envVar: 'VITE_FIREBASE_PROJECT_ID' },
    { key: 'storageBucket', envVar: 'VITE_FIREBASE_STORAGE_BUCKET' },
    { key: 'messagingSenderId', envVar: 'VITE_FIREBASE_MESSAGING_SENDER_ID' },
    { key: 'appId', envVar: 'VITE_FIREBASE_APP_ID' },
  ];

  const missing = required.filter(({ key }) => !firebaseConfig[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing
        .map(({ envVar }) => envVar)
        .join(', ')}. Add them to .env (see .env.example).`
    );
  }
}

// Avoid duplicate initialization in dev / HMR
assertFirebaseConfig();
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
