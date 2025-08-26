import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { ButtonHTMLAttributes } from "react";

interface GoogleSignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function GoogleSignInButton({ children, onClick, disabled, ...props }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await signInWithGoogle();
      if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error; // Re-throw to allow parent to handle the error
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center gap-2"
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <FaGoogle className="h-4 w-4" />
      {children || <span>Continue with Google</span>}
    </Button>
  );
}
