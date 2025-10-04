import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  User as FirebaseUser,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth, db, googleProvider } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: string;
  providerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Maximum number of sign-in attempts before rate limiting
const MAX_SIGN_IN_ATTEMPTS = 5;
const SIGN_IN_ATTEMPTS_KEY = 'signInAttempts';
const LAST_ATTEMPT_TIME_KEY = 'lastSignInAttempt';
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface SignInAttempts {
  count: number;
  lastAttempt: number;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Track sign-in attempts
  const trackSignInAttempt = useCallback((failed: boolean = false) => {
    const now = Date.now();
    const stored = sessionStorage.getItem(SIGN_IN_ATTEMPTS_KEY);
    let attempts: SignInAttempts = stored 
      ? JSON.parse(stored) 
      : { count: 0, lastAttempt: 0 };
    
    // Reset counter if window has passed
    if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW_MS) {
      attempts = { count: 0, lastAttempt: now };
    }
    
    // Increment counter if this is a failed attempt
    if (failed) {
      attempts.count += 1;
      attempts.lastAttempt = now;
      sessionStorage.setItem(SIGN_IN_ATTEMPTS_KEY, JSON.stringify(attempts));
    }
    
    // Check if rate limited
    const isRateLimited = attempts.count >= MAX_SIGN_IN_ATTEMPTS;
    
    if (isRateLimited) {
      const timeLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - attempts.lastAttempt)) / 1000 / 60);
      const error = new Error(`Too many sign-in attempts. Please try again in ${timeLeft} minutes.`) as Error & { code?: string };
      error.code = 'auth/too-many-requests';
      throw error;
    }
    
    return attempts.count;
  }, []);
  
  // Clear sign-in attempts on success
  const clearSignInAttempts = useCallback(() => {
    sessionStorage.removeItem(SIGN_IN_ATTEMPTS_KEY);
    sessionStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
  }, []);

  // Sync user profile with Firestore
  const syncUserProfile = useCallback(async (user: FirebaseUser): Promise<UserProfile> => {
    if (!user) throw new Error('No user provided');
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const now = new Date();
    
    const userData = {
      uid: user.uid,
      displayName: user.displayName || userSnap.data()?.displayName || 'User',
      email: user.email || '',
      photoURL: user.photoURL || userSnap.data()?.photoURL || '',
      phoneNumber: user.phoneNumber || userSnap.data()?.phoneNumber || '',
      role: userSnap.data()?.role || 'user',
      providerId: user.providerData[0]?.providerId || 'firebase',
      createdAt: userSnap.data()?.createdAt?.toDate?.() || now,
      updatedAt: now
    };

    if (userSnap.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
    }

    return userData;
  }, []);

  // Google Sign In with rate limiting and improved error handling
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      
      // Track this attempt and check rate limiting
      trackSignInAttempt(false);
      
      // Check if this is a direct user interaction
      const isUserInteraction = document.visibilityState === 'visible';
      if (!isUserInteraction) {
        throw new Error('Sign-in must be triggered by a user interaction');
      }
      
      // Use the pre-configured Google provider
      const provider = googleProvider;
      
      console.log('Google provider configured, opening popup...');
      
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign-in successful, user:', result.user?.email);
        
        if (!result.user) {
          throw new Error('No user returned from Google sign-in');
        }
        
        // Clear attempts on successful sign-in
        clearSignInAttempts();
        
        console.log('Syncing user profile...');
        const profile = await syncUserProfile(result.user);
        setCurrentUser(result.user);
        setUserProfile(profile);
        
        console.log('Google sign-in flow completed successfully');
        
        return result;
      } catch (popupError) {
        const authError = popupError as AuthError & { code?: string; customData?: { email?: string } };
        console.error('Popup error details:', {
          code: authError.code,
          message: authError.message,
          email: authError.customData?.email,
          details: authError
        });
        
        // Track failed attempt
        trackSignInAttempt(true);
        
        // Handle specific error cases
        if (authError.code === 'auth/popup-blocked') {
          throw new Error('Please allow popups for this site to sign in with Google');
        } else if (authError.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign in was cancelled');
        } else if (authError.code === 'auth/account-exists-with-different-credential') {
          throw new Error('An account already exists with the same email but different sign-in method');
        } else if (authError.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection.');
        }
        
        throw authError;
      }
    } catch (err) {
      const signInError = err as AuthError & { name?: string; code?: string; message?: string };
      console.error('Google sign-in error details:', {
        name: signInError.name,
        code: signInError.code,
        message: signInError.message,
        fullError: JSON.stringify(signInError, Object.getOwnPropertyNames(signInError))
      });
      
      let errorMessage = 'Failed to sign in with Google';
      
      // Map common error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/popup-closed-by-user': 'Sign in was cancelled',
        'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method',
        'auth/email-already-in-use': 'This email is already in use with a different account',
        'auth/credential-already-in-use': 'This credential is already associated with a different user account',
        'auth/requires-recent-login': 'Please sign in again to continue',
        'auth/user-token-expired': 'Your session has expired. Please sign in again.'
      };
      
      if (signInError.code && errorMessages[signInError.code as keyof typeof errorMessages]) {
        // Use the error message from the error object if available
        if (signInError.message) {
          errorMessage = signInError.message;
        } else if (signInError.code && errorMessages[signInError.code]) {
          errorMessage = errorMessages[signInError.code];
        }
      }
      
      toast({
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw signInError;
    } finally {
      setLoading(false);
    }
  }, [toast, trackSignInAttempt, clearSignInAttempts, syncUserProfile]);

  // Sign Out
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(null);
      clearSignInAttempts();
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError);
      setAuthError(authError.message || 'Failed to sign out');
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user is signed in');
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Update Firestore
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update auth profile if needed
      const authUpdates: { displayName?: string | null; photoURL?: string | null } = {};
      if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
      if (updates.photoURL !== undefined) authUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(authUpdates).length > 0) {
        await updateAuthProfile(currentUser, authUpdates);
        await currentUser.reload();
      }
      
      // Update local state
      setUserProfile(prev => ({
        ...prev!,
        ...updates,
        updatedAt: new Date()
      }));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setCurrentUser(user);
          setUserProfile(profile);
          
          // Show welcome message on successful sign-in
          toast({
            title: 'Signed in successfully',
            description: `Welcome back, ${user.displayName || 'User'}!`,
          });
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserProfile, toast, setLoading]); // Add 'toast' and 'setLoading' to the dependency array

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
