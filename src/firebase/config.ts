// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider, 
  signInWithPopup, 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parking-slot-allocation-a41a1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with memory cache (to avoid IndexedDB issues)
// If you want persistence, clear browser IndexedDB first
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection even when one account is available
});

// Helper function to get user document reference
const getUserDoc = (userId: string) => doc(db, 'users', userId);

// Helper function to create or update user profile in Firestore
const updateUserProfile = async (user: User, additionalData: Record<string, any> = {}) => {
  const userRef = getUserDoc(user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const { email, displayName, photoURL, phoneNumber } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        phoneNumber,
        emailVerified: user.emailVerified,
        providerData: user.providerData.map(({ providerId, uid }) => ({ providerId, uid })),
        createdAt,
        updatedAt: createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error; // Re-throw to handle in the calling function
    }
  } else {
    // Update existing user document if needed
    try {
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  }
  
  return userRef;
};

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  updateUserProfile,
  getUserDoc
};

export type { User };