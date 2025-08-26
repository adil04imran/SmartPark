import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard = ({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle redirects based on auth state and requirements
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
  if (requireAdmin) {
    const isAdmin = user?.uid === 'ADMIN_UID'; // Replace with actual admin check
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
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