import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo_placeholder_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resqnet-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resqnet-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resqnet-demo.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000'
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn('⚠️ VITE_FIREBASE_API_KEY is missing. Copy client/.env.example to client/.env and add your Firebase credentials.');
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
