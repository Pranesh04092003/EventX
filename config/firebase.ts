import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByEifKJMMgzwIwh5XHWivqM9hmmsv4JkU",
  authDomain: "eventx-app-2025.firebaseapp.com",
  projectId: "eventx-app-2025",
  storageBucket: "eventx-app-2025.firebasestorage.app",
  messagingSenderId: "876281632311",
  appId: "1:876281632311:web:fbcc8d1c34674d7bb111b2",
  measurementId: "G-CH6W0FP244"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app; 