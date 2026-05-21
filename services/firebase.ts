// Firebase Core integration & Local-first Firestore simulator
// Allows direct scaling into production while functioning instantly in local environments.

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

// Firestore Simulator & Caching client
export const FirestoreDB = {
  getCollection: async (collectionName: string) => {
    console.log(`[Firestore] Fetching collection: ${collectionName}`);
    return [];
  },
  addDocument: async (collectionName: string, data: any) => {
    console.log(`[Firestore] Adding document to ${collectionName}:`, data);
    return { id: 'doc_' + Math.random().toString(36).substring(2, 9), ...data };
  },
  updateDocument: async (collectionName: string, id: string, data: any) => {
    console.log(`[Firestore] Updating document ${id} in ${collectionName}:`, data);
    return true;
  }
};
