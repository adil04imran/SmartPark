import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { ButtonHTMLAttributes, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GoogleSignInButton({ children, onClick, disabled, ...props }: GoogleSignInButtonProps) {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle navigation after successful sign-in
  useEffect(() => {
    // This will prevent the component from processing multiple times
    let isMounted = true;
    
    // If we were processing and the auth is no longer loading, we can assume sign-in is complete
    if (isProcessing && !authLoading) {
      if (isMounted) {
        setIsProcessing(false);
        setIsLoading(false);
        navigate('/'); // Or any other route you want to redirect to after sign-in
      }
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, isProcessing, navigate]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Prevent multiple clicks
    if (isLoading || isProcessing) {
      return;
    }
    
    // Check if popups are blocked
    const isPopupBlocked = () => {
      try {
        // Try opening a popup
        const popup = window.open('', '_blank', 'width=1,height=1,left=0,top=0');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          return true;
        }
        popup.close();
        return false;
      } catch (error) {
        console.error('Error checking popup:', error);
        return true;
      }
    };

    if (isPopupBlocked()) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to sign in with Google.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsProcessing(true);
      
      // Call the signInWithGoogle function from auth context
      await signInWithGoogle();
      
      // The actual navigation will be handled by the useEffect above
      // when the auth state changes and loading becomes false
      
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setIsLoading(false);
      setIsProcessing(false);
      
      // Handle different error types
      const error = err as Error & { code?: string; message?: string };
      
      // Only show error toast if it's not a popup closed by user
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2 relative"
      onClick={handleClick}
      disabled={disabled || isLoading || isProcessing}
      type="button"
      {...props}
    >
      {isLoading ? (
        <>
          <div className="absolute left-4 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <FaGoogle className="h-4 w-4" />
          {children || <span>Continue with Google</span>}
        </>
      )}
    </Button>
  );
}
