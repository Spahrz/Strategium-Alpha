import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Initialize Firebase using Environment Variables (Vercel)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

// Check if we have env vars to init immediately
if (firebaseConfig.apiKey) {
    try {
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        db = getFirestore(app);
    } catch (e) {
        console.error("Error initializing Firebase with env config", e);
    }
}

export const configureFirebase = (config: FirebaseOptions) => {
    if (getApps().length === 0) {
        app = initializeApp(config);
        db = getFirestore(app);
    } else {
        // App already exists, just get it
        app = getApp();
        db = getFirestore(app);
    }
};

export const isFirebaseInitialized = () => {
    return !!app && !!db;
};

// Helper function to maintain compatibility with storageService
export const getDb = () => {
    if (!db) {
        // Try to recover if app was initialized elsewhere
        if (getApps().length > 0) {
            app = getApp();
            db = getFirestore(app);
        } else {
            throw new Error("Firebase not initialized. Please ensure API keys are configured.");
        }
    }
    return db;
};