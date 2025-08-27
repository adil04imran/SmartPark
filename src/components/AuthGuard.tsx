import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard = ({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) => {
  // State hooks must be called unconditionally at the top level
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle admin check when user changes
  useEffect(() => {
    const checkAdmin = async () => {
      if (requireAdmin && user) {
        try {
          // Get the user's ID token result
          const idTokenResult = await getIdTokenResult(user, true);
          // Check for admin claim
          if (idTokenResult.claims.admin === true) {
            setIsAdmin(true);
            setAuthChecked(true);
          } else {
            // If no admin claim, check Firestore as fallback
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data()?.role === 'admin') {
              // Add admin claim to the user
              await fetch('/api/set-admin-claim', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: user.uid }),
              });
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
            setAuthChecked(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAuthChecked(true);
        }
      } else if (!requireAdmin) {
        // If admin check is not required, mark as checked
        setAuthChecked(true);
      }
    };

    checkAdmin();
  }, [requireAdmin, user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle unauthenticated users trying to access protected routes
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Handle authenticated users trying to access auth pages
  if ((location.pathname === '/login' || location.pathname === '/register') && user) {
    return <Navigate to="/locations" replace />;
  }

  // Handle non-admin users trying to access admin routes
  if (requireAdmin && (!authChecked || !isAdmin)) {
    // Show loading state while checking admin status
    if (!authChecked) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return { 
    currentUser: user,
    loading,
    signOut,
    signInWithGoogle: async () => {
      // This is a placeholder - the actual implementation is in AuthProvider
      throw new Error('signInWithGoogle must be called from AuthProvider');
    }
  };
};