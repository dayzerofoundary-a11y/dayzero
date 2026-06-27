import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// All Firebase credentials are loaded from environment variables.
// NEVER hardcode these values — set them in your .env file as VITE_FIREBASE_* keys.
// The old hardcoded values have been removed; rotate the Firebase API key in the
// Google Cloud Console if this file was previously committed to git.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
