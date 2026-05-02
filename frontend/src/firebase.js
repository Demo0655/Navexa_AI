import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBWZBMrFtQlev3Xo7EF-lnpuGdnzokOSBs",
  authDomain: "navexa-ai-b4298.firebaseapp.com",
  projectId: "navexa-ai-b4298",
  storageBucket: "navexa-ai-b4298.firebasestorage.app",
  messagingSenderId: "792070651636",
  appId: "1:792070651636:web:3bfcb76cd759135a1168a1",
  measurementId: "G-B9N4XD3W96"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
export default app;
