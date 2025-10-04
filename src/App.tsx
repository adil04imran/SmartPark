import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupBookingExpirationCheck } from '@/utils/bookingManager';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Locations from "./pages/Locations";
import Slots from "./pages/Slots";
import BookingConfirmation from "./pages/BookingConfirmation";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import PopularLocations from "./pages/PopularLocations";
import HowItWorks from "./pages/HowItWorks";
import Safety from "./pages/Safety";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentUser } = useAuth();

  // Setup booking expiration check when user is authenticated
  useEffect(() => {
    if (currentUser) {
      // Start the booking expiration check
      const cleanup = setupBookingExpirationCheck(currentUser.uid);
      
      // Cleanup on unmount
      return () => {
        cleanup?.();
      };
    }
  }, [currentUser]);

  return (
    <Routes>
      <Route path="/" element={
        <AuthGuard>
          <Landing />
        </AuthGuard>
      } />
      <Route path="/login" element={
        <AuthGuard>
          <Login />
        </AuthGuard>
      } />
      <Route path="/register" element={
        <AuthGuard>
          <Register />
        </AuthGuard>
      } />
      <Route path="/locations" element={
        <AuthGuard requireAuth>
          <Locations />
        </AuthGuard>
      } />
      <Route path="/slots/:locationId" element={
        <AuthGuard requireAuth>
          <Slots />
        </AuthGuard>
      } />
      <Route path="/popular-locations" element={
        <PopularLocations />
      } />
      <Route path="/how-it-works" element={
        <HowItWorks />
      } />
      <Route path="/safety" element={
        <Safety />
      } />
      <Route path="/booking-confirmation" element={
        <AuthGuard requireAuth>
          <BookingConfirmation />
        </AuthGuard>
      } />
      <Route path="/bookings" element={
        <AuthGuard requireAuth>
          <Bookings />
        </AuthGuard>
      } />
      <Route path="/profile" element={
        <AuthGuard requireAuth>
          <Profile />
        </AuthGuard>
      } />
      <Route path="/admin" element={
        <AuthGuard requireAuth requireAdmin>
          <Admin />
        </AuthGuard>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
