import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBaMOj5RSYj7Qdb0xEHi70IjdsUbSNJvgE",
  authDomain: "road-sos-3b424.firebaseapp.com",
  projectId: "road-sos-3b424",
  storageBucket: "road-sos-3b424.firebasestorage.app",
  messagingSenderId: "476256496723",
  appId: "1:476256496723:web:placeholder", 
};

// Initialize Firebase only if it hasn't been already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

