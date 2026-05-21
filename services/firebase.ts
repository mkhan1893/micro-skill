import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// High-Fidelity Firebase Configuration
// Uses Expo environment variables prefixed with EXPO_PUBLIC_ for compile-time bundling.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

// Check if we are running in a mock environment (e.g. initial clone or credential-less launch)
export const isMockFirebase = firebaseConfig.apiKey === "mock-api-key" || firebaseConfig.apiKey.includes("replace-with-your-real-key");

// --- INITIALIZE REAL CORE SERVICES OR FALLBACKS ---
let app;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!isMockFirebase) {
  try {
    // Prevent double initialization errors in HMR/Fast Refresh environments
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Set up persistence strictly depending on platform:
    // React Native AsyncStorage on mobile, standard indexedDB/localstorage on Web.
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }

    db = getFirestore(app);
    storage = getStorage(app);
    console.log("[Firebase] Service layer initialized successfully with persistent native adapters.");
  } catch (err) {
    console.error("[Firebase] Native initialization failed. Defaulting to local-first cache models:", err);
    // Force mock mode if initialization fails due to malformed configs
    (isMockFirebase as any) = true;
  }
}

export { auth, db, storage };

// --- FIRESTORE HIGH-PERFORMANCE HELPER WRAPPERS ---
// Fully typed, production-ready abstraction layers that bridge Firestore collections 
// while ensuring local resiliency in mock environments.
export const FirestoreDB = {
  // Fetch all documents in a collection
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    if (isMockFirebase) {
      console.log(`[Firestore Mock] Fetching mock items from collection: ${collectionName}`);
      return [];
    }
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as T[];
    } catch (err) {
      console.error(`[Firestore] getCollection Error for ${collectionName}:`, err);
      throw err;
    }
  },

  // Get a single document by unique identifier
  getDocument: async <T>(collectionName: string, docId: string): Promise<T | null> => {
    if (isMockFirebase) {
      console.log(`[Firestore Mock] Fetching mock document: ${collectionName}/${docId}`);
      return null;
    }
    try {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as T;
      }
      return null;
    } catch (err) {
      console.error(`[Firestore] getDocument Error for ${collectionName}/${docId}:`, err);
      throw err;
    }
  },

  // Save/Overwrite a document
  setDocument: async <T extends object>(collectionName: string, docId: string, data: T): Promise<void> => {
    if (isMockFirebase) {
      console.log(`[Firestore Mock] Overwriting document in ${collectionName}/${docId}:`, data);
      return;
    }
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
    } catch (err) {
      console.error(`[Firestore] setDocument Error for ${collectionName}/${docId}:`, err);
      throw err;
    }
  },

  // Update specific fields on an existing document
  updateDocument: async (collectionName: string, docId: string, data: Record<string, any>): Promise<void> => {
    if (isMockFirebase) {
      console.log(`[Firestore Mock] Updating document ${collectionName}/${docId}:`, data);
      return;
    }
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (err) {
      console.error(`[Firestore] updateDocument Error for ${collectionName}/${docId}:`, err);
      throw err;
    }
  },

  // Delete document
  deleteDocument: async (collectionName: string, docId: string): Promise<void> => {
    if (isMockFirebase) {
      console.log(`[Firestore Mock] Deleting document: ${collectionName}/${docId}`);
      return;
    }
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error(`[Firestore] deleteDocument Error for ${collectionName}/${docId}:`, err);
      throw err;
    }
  }
};
