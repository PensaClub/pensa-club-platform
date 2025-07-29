import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_apiKey,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_authDomain,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_projectId,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_storageBucket,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_messagingSenderId,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_appId,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_measurementId,
};

const app = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app);