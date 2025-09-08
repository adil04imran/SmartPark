import { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/firebase/config';
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
  signInWithGoogle: () => Promise<void>;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sync user profile with Firestore
  const syncUserProfile = async (user: FirebaseUser): Promise<UserProfile> => {
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
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      
      // Check if this is a direct user interaction
      const isUserInteraction = document.visibilityState === 'visible';
      if (!isUserInteraction) {
        throw new Error('Sign-in must be triggered by a user interaction');
      }
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('Google provider configured, opening popup...');
      
      try {
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign-in successful, user:', result.user?.email);
        
        if (!result.user) {
          throw new Error('No user returned from Google sign-in');
        }
        
        console.log('Syncing user profile...');
        const profile = await syncUserProfile(result.user);
        setCurrentUser(result.user);
        setUserProfile(profile);
        
        console.log('Google sign-in flow completed successfully');
      } catch (popupError) {
        console.error('Popup error details:', {
          code: popupError?.code,
          message: popupError?.message,
          email: popupError?.customData?.email,
          details: popupError
        });
        
        // If popup is blocked, show a specific message
        if (popupError?.code === 'auth/popup-blocked' || 
            popupError?.code === 'auth/popup-closed-by-user' ||
            popupError?.message?.includes('popup')) {
          throw new Error('Please allow popups for this site to sign in with Google');
        }
        throw popupError;
      }
    } catch (error) {
      console.error('Google sign-in error details:', {
        name: error?.name,
        code: error?.code,
        message: error?.message,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      let errorMessage = 'Failed to sign in with Google';
      
      if (error?.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error?.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in credentials';
      } else if (error?.code) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
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
      const authUpdates: any = {};
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
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
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
