// Initialize Firebase and any other Firebase services here
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRICmQ1oxqeWyVWAy-7WJIA-Qisn7YexU",
  authDomain: "parking-slot-allocation-a41a1.firebaseapp.com",
  projectId: "parking-slot-allocation-a41a1",
  storageBucket: "parking-slot-allocation-a41a1.firebasestorage.app",
  messagingSenderId: "546906065109",
  appId: "1:546906065109:web:6c216df369b5029e85fa5c",
  measurementId: "G-KK5M0BPZE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
