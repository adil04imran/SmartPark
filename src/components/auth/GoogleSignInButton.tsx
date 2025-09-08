import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { ButtonHTMLAttributes, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GoogleSignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GoogleSignInButton({ children, onClick, disabled, ...props }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Check if popups are blocked
    const isPopupBlocked = () => {
      const popup = window.open('', '_blank');
      if (popup) {
        popup.close();
        return false;
      }
      return true;
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
      await signInWithGoogle();
      if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Error is already handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2 relative"
      onClick={handleClick}
      disabled={disabled || isLoading}
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
