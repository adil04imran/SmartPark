import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/BookingCard';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch user-specific bookings from Firestore
  useEffect(() => {
    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          locationName: data.locationName || data.location_name || 'Unknown Location',
          slotId: data.slotId || data.slot_id || 'N/A',
          date: data.bookingDate || data.date || new Date().toISOString().split('T')[0],
          startTime: data.startTime || data.start_time || '00:00',
          endTime: data.endTime || data.end_time || '00:00',
          duration: data.duration || 1,
          totalCost: data.totalCost || data.total_amount || 0,
          status: data.status || 'active',
        } as Booking;
      });
      
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, toast]);

  // Filter bookings based on search and tab
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'active') {
      return matchesSearch && booking.status === 'active';
    } else if (activeTab === 'completed') {
      return matchesSearch && booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return matchesSearch && booking.status === 'cancelled';
    }
    
    return matchesSearch;
  });

  const handleViewDetails = (bookingId: string) => {
    toast({
      title: "View Details",
      description: `Viewing details for booking ${bookingId}`,
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Booking Cancelled",
        description: `Booking has been cancelled successfully.`,
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: 'destructive',
      });
    }
  };

  const getBookingStats = () => {
    return {
      total: bookings.length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      totalSpent: bookings.reduce((sum, b) => sum + b.totalCost, 0)
    };
  };

  const stats = getBookingStats();

  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">View and manage your parking reservations</p>
      </div>
      <Button className="w-full md:w-auto" onClick={() => navigate('/locations')}>
        <Plus className="h-4 w-4 mr-2" />
        New Booking
      </Button>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <PageLayout header={header}>
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </div>
      </PageLayout>
    );
  }

  // Show login prompt if not authenticated
  if (!currentUser) {
    return (
      <PageLayout header={header}>
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">Please sign in to view your bookings</p>
          <Button onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout header={header}>
      <div className="py-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Search and Filters */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings by location or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.completed}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">${stats.totalSpent}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4">All</TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                Active
                {stats.active > 0 && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-1.5">
                    {stats.active}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm px-2 sm:px-4">Done</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs sm:text-sm px-2 sm:px-4">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
                emptyMessage="No bookings found"
              />
            </TabsContent>

            <TabsContent value="active" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
                emptyMessage="No active bookings"
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
                emptyMessage="No completed bookings"
              />
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
                emptyMessage="No cancelled bookings"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

interface Booking {
  id: string;
  locationName: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface BookingsListProps {
  bookings: Booking[];
  onViewDetails: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  emptyMessage: string;
}

const BookingsList = ({ bookings, onViewDetails, onCancel, emptyMessage }: BookingsListProps) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onViewDetails={onViewDetails}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default Bookings;