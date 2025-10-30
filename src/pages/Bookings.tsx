import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/BookingCard';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, Filter, Plus, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '@/firebase/config';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    status: string[];
    dateRange: { from: string; to: string } | null;
  }>({
    status: [],
    dateRange: null
  });
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

  // Toggle filter
  const toggleFilter = (filterType: 'status', value: string) => {
    setFilters(prev => {
      const currentFilters = [...prev[filterType]];
      const valueIndex = currentFilters.indexOf(value);
      
      if (valueIndex === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(valueIndex, 1);
      }
      
      return {
        ...prev,
        [filterType]: currentFilters
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: [],
      dateRange: null
    });
  };

  // Filter bookings based on search, tab, and filters
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      booking.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filter
    const matchesTab = activeTab === 'all' || booking.status === activeTab;

    // Status filter
    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(booking.status);

    // Date range filter
    const matchesDateRange = !filters.dateRange || (
      booking.date >= filters.dateRange.from && 
      booking.date <= (filters.dateRange.to || filters.dateRange.from)
    );
    
    return matchesSearch && matchesTab && matchesStatus && matchesDateRange;
  });

  // Check if any filters are active
  const hasActiveFilters = filters.status.length > 0 || filters.dateRange !== null;

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Get the booking document first to get the slot ID
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const bookingData = bookingDoc.data();
      const slotId = bookingData.slotId || bookingData.slot_id;
      
      if (!slotId) {
        throw new Error('Slot ID not found in booking');
      }
      
      // Start a batch to update both documents atomically
      const batch = writeBatch(db);
      
      // Update booking status to cancelled
      const bookingRef = doc(db, 'bookings', bookingId);
      batch.update(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
      
      // Update slot status to available
      const slotRef = doc(db, 'slots', slotId);
      batch.update(slotRef, {
        status: 'available',
        isAvailable: true,
        is_available: true,
        updatedAt: new Date().toISOString(),
      });
      
      // Commit the batch
      await batch.commit();
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled and the slot is now available.",
      });
      
      console.log(`Booking ${bookingId} cancelled and slot ${slotId} released`);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking. Please try again.",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-2 py-1.5 text-sm font-semibold">Status</div>
                <DropdownMenuItem 
                  onSelect={(e) => { e.preventDefault(); toggleFilter('status', 'active'); }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <div className={`h-4 w-4 border rounded mr-2 flex items-center justify-center ${filters.status.includes('active') ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                      {filters.status.includes('active') && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>Active</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => { e.preventDefault(); toggleFilter('status', 'completed'); }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <div className={`h-4 w-4 border rounded mr-2 flex items-center justify-center ${filters.status.includes('completed') ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                      {filters.status.includes('completed') && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>Completed</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => { e.preventDefault(); toggleFilter('status', 'cancelled'); }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center w-full">
                    <div className={`h-4 w-4 border rounded mr-2 flex items-center justify-center ${filters.status.includes('cancelled') ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                      {filters.status.includes('cancelled') && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span>Cancelled</span>
                  </div>
                </DropdownMenuItem>
                {hasActiveFilters && (
                  <>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem 
                      onSelect={(e) => { e.preventDefault(); clearFilters(); }}
                      className="cursor-pointer text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <button 
                    onClick={() => toggleFilter('status', status)}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.dateRange && (
                <Badge variant="secondary" className="gap-1">
                  {new Date(filters.dateRange.from).toLocaleDateString()}
                  {filters.dateRange.to && ` - ${new Date(filters.dateRange.to).toLocaleDateString()}`}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, dateRange: null }))}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}

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
                onCancel={handleCancelBooking}
                emptyMessage="No bookings found"
              />
            </TabsContent>

            <TabsContent value="active" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onCancel={handleCancelBooking}
                emptyMessage="No active bookings"
              />
            </TabsContent>

            <TabsContent value="completed" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
                onCancel={handleCancelBooking}
                emptyMessage="No completed bookings"
              />
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4 sm:mt-6">
              <BookingsList 
                bookings={filteredBookings}
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
  onCancel: (bookingId: string) => void;
  emptyMessage: string;
}

const BookingsList = ({ bookings, onCancel, emptyMessage }: Omit<BookingsListProps, 'onViewDetails'>) => {
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
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default Bookings;