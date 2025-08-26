import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { currentUser, userProfile, signOut, loading } = useAuth();
  const [profilePic, setProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Update profile data when userProfile or currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setProfilePic('');
      setDisplayName('');
      return;
    }

    // Set profile picture with priority: userProfile.photoURL > currentUser.photoURL
    if (userProfile?.photoURL) {
      setProfilePic(userProfile.photoURL);
    } else if (currentUser.photoURL) {
      setProfilePic(currentUser.photoURL);
    } else {
      setProfilePic('');
    }
    
    // Set display name with priority: userProfile.displayName > currentUser.displayName > email prefix
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    } else if (currentUser.displayName) {
      setDisplayName(currentUser.displayName);
    } else if (currentUser.email) {
      setDisplayName(currentUser.email.split('@')[0]);
    } else {
      setDisplayName('User');
    }
  }, [currentUser, userProfile]);

  // Real-time subscription to user profile updates
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.photoURL && data.photoURL !== profilePic) {
          setProfilePic(data.photoURL);
        }
        if (data.displayName && data.displayName !== displayName) {
          setDisplayName(data.displayName);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, profilePic, displayName]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span className="font-bold">ParkWise</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <Car className="h-6 w-6" />
          <span className="font-bold">ParkWise</span>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden items-center space-x-4 md:flex">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/">Home</Link>
            </Button>
            {currentUser && (
              <Button
                asChild
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                size="sm"
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {profilePic ? (
                        <AvatarImage src={profilePic} alt={displayName} />
                      ) : (
                        <AvatarFallback>
                          {displayName ? getInitials(displayName) : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container flex flex-col space-y-2 py-2">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/">Home</Link>
            </Button>
            {currentUser && (
              <Button
                asChild
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
