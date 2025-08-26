// Re-export from the main Firebase initialization file
import { auth, db } from './init';
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup };
export type { User };
