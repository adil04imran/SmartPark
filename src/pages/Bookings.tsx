import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/BookingCard';
import Navbar from '@/components/Navbar';
import { mockBookings as initialBookings, mockLocations } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState(initialBookings);

  // Update booking location names to match current mock data
  useEffect(() => {
    const updatedBookings = initialBookings.map(booking => {
      const location = mockLocations.find(loc => 
        booking.locationName.toLowerCase().includes(loc.name.split(' ')[0].toLowerCase())
      );
      
      return location ? { ...booking, locationName: location.name } : booking;
    });
    
    setBookings(updatedBookings);
  }, []);

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

  const handleCancelBooking = (bookingId: string) => {
    toast({
      title: "Booking Cancelled",
      description: `Booking ${bookingId} has been cancelled successfully.`,
    });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
              <p className="text-muted-foreground">Manage your parking reservations</p>
            </div>
            <Button className="btn-gradient" onClick={() => navigate('/locations')}>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">${stats.totalSpent}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings by location or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active
              {stats.active > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.active}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BookingsList 
              bookings={filteredBookings}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelBooking}
              emptyMessage="No bookings found"
            />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <BookingsList 
              bookings={filteredBookings}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelBooking}
              emptyMessage="No active bookings"
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <BookingsList 
              bookings={filteredBookings}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelBooking}
              emptyMessage="No completed bookings"
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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