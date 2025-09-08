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
import { Menu, X, Car, User, LogOut, Sparkles, MapPin, Clock, Shield, ArrowRight, Bell, HelpCircle, DollarSign } from 'lucide-react';
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
      name: 'Popular Locations', 
      href: '/popular-locations', 
      icon: <MapPin className="h-4 w-4 mr-2" />
    },
    { 
      name: 'Safety', 
      href: '/safety', 
      icon: <Shield className="h-4 w-4 mr-2" /> 
    }
  ];

  if (loading) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background/80'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Improved for mobile */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <Car className="h-6 w-6 text-primary md:h-7 md:w-7" />
              <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:text-lg">
                SmartPark
              </span>
            </Link>
            <div className="flex-1 flex items-center justify-end">
              <div className="flex space-x-4">
                {navLinks.slice(0, 4).map((link) => (
                  <div key={link.name} className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background/80'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Improved for mobile */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Car className="h-6 w-6 text-primary md:h-7 md:w-7" />
            <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:text-lg">
              SmartPark
            </span>
          </Link>
          <div className="flex-1 flex items-center justify-end">
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "group relative flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <span className="relative">
                      {link.icon}
                      {link.badge && (
                        <span className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {link.badge}
                        </span>
                      )}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                  <motion.div
                    className={cn(
                      "absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-blue-500 rounded-full",
                      location.pathname === '/' && !scrolled ? 'bg-white' : 'bg-blue-500',
                      "w-0 group-hover:w-3/4 transition-all duration-300"
                    )}
                    layoutId="activeNavLink"
                  />
                </motion.div>
              ))}
            </div>

            {/* Notification Button */}
            <div className="hidden md:flex items-center space-x-2 mr-4">
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative",
                    location.pathname === '/' && !scrolled && 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {currentUser ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "rounded-full border-2 border-transparent hover:border-blue-500/20",
                      location.pathname === '/' && !scrolled && 'text-white hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Link to="/locations">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find Parking
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "rounded-full p-0 h-10 w-10 relative overflow-hidden border-2 border-transparent hover:border-blue-500/20",
                          location.pathname === '/' && !scrolled && 'text-white hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profilePic} alt={displayName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {displayName ? displayName[0].toUpperCase() : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profilePic} alt={displayName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {displayName ? displayName[0].toUpperCase() : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          {displayName && <p className="font-medium">{displayName}</p>}
                          {currentUser.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
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
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="rounded-full text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </Button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => navigate('/register')}
                      className={cn(
                        "rounded-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg shadow-blue-500/20",
                        location.pathname === '/' && !scrolled && 'shadow-white/10'
                      )}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground h-10 w-10"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed inset-x-0 top-16 bg-background shadow-lg overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.name}
                      asChild
                      variant={isActive(link.href) ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to={link.href}>
                        <span className="mr-2">{link.icon}</span>
                        {link.name}
                      </Link>
                    </Button>
                  ))}
                  
                  {currentUser ? (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="pt-2 border-t mt-2">
                      <Button
                        asChild
                        variant="default"
                        className="w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link to="/login">
                          Sign In
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
