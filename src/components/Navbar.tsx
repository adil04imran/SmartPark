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
import { Menu, X, Car, User, LogOut, MapPin, Clock, Shield, ArrowRight, Bell, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { currentUser, userProfile, signOut, loading } = useAuth();
  const [profilePic, setProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks: NavLink[] = [
    { 
      name: 'Locations', 
      href: '/locations', 
      icon: <MapPin className="h-4 w-4" />
    },
    { 
      name: 'Bookings', 
      href: '/bookings', 
      icon: <Calendar className="h-4 w-4" /> 
    }
  ];

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-600 to-primary/70 bg-clip-text text-transparent sm:text-xl">
                SmartPark
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-muted rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      scrolled ? 'bg-background/95 backdrop-blur-md shadow-md border-border' : 'bg-background/80 backdrop-blur-sm border-transparent'
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="relative">
              <Car className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-600 to-primary/70 bg-clip-text text-transparent sm:text-xl">
              SmartPark
            </span>
          </Link>
          <div className="flex-1 flex items-center justify-end">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.icon}
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>


            <div className="flex items-center gap-2">
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="hidden lg:flex rounded-lg p-0 h-10 w-10 relative overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profilePic} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {displayName ? displayName[0].toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3 border-b">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                        <AvatarImage src={profilePic} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {displayName ? displayName[0].toUpperCase() : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none flex-1 min-w-0">
                        {displayName && <p className="font-semibold text-sm">{displayName}</p>}
                        {currentUser.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {currentUser.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="w-full cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="w-full cursor-pointer">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        signOut();
                        toast({
                          title: 'Signed out',
                          description: 'You have been signed out.',
                        });
                      }} 
                      className="w-full cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="rounded-lg hover:bg-accent"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="rounded-lg bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden ml-2 h-10 w-10"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-x-0 top-16 bg-background border-b shadow-lg overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
              >
                <div className="px-4 pt-4 pb-6 space-y-2">
                  {/* User Profile Section - Mobile */}
                  {currentUser && (
                    <div className="flex items-center gap-3 p-3 mb-4 bg-accent/50 rounded-lg">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={profilePic} alt={displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {displayName ? displayName[0].toUpperCase() : <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="font-semibold text-sm">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Find Parking - Mobile */}
                  <Button
                    asChild
                    variant="default"
                    className="w-full justify-start mb-3 bg-primary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/locations">
                      <MapPin className="mr-3 h-5 w-5" />
                      <span className="font-medium">Find Parking</span>
                    </Link>
                  </Button>
                  
                  {/* Navigation Links - Mobile */}
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Button
                        key={link.name}
                        asChild
                        variant={isActive(link.href) ? 'secondary' : 'ghost'}
                        className="w-full justify-start rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to={link.href}>
                          <span className="mr-3">{link.icon}</span>
                          <span className="font-medium">{link.name}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                  
                  {currentUser ? (
                    <div className="pt-3 mt-3 border-t space-y-1">
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to="/profile">
                          <User className="mr-3 h-5 w-5" />
                          <span className="font-medium">Profile</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-3 mt-3 border-t space-y-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-center rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to="/login">
                          <span className="font-medium">Sign In</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to="/register">
                          <span className="font-medium">Create Account</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
