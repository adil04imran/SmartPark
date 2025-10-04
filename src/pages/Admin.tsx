import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthGuard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/layout/PageLayout';
import { 
  Car, 
  MapPin, 
  Users, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  LogOut
} from 'lucide-react';
import { generateSlotsForLocation } from '@/utils/slotGenerator';

interface Location {
  id: string;
  name: string;
  address: string;
  total_slots: number;
  available_slots: number;
  pricing_per_hour: number;
  created_at: string;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  profiles: {
    full_name: string;
  };
  locations: {
    name: string;
  };
}

const Admin = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_slots: '',
    pricing_per_hour: ''
  });
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up real-time listeners
  useEffect(() => {
    // Locations listener
    const locationsQuery = query(collection(db, 'locations'), orderBy('created_at', 'desc'));
    const unsubscribeLocations = onSnapshot(locationsQuery, (snapshot) => {
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        address: doc.data().address || '',
        total_slots: doc.data().total_slots || 0,
        available_slots: doc.data().available_slots || 0,
        pricing_per_hour: doc.data().pricing_per_hour || 0,
        created_at: doc.data().created_at || ''
      })) as Location[];
      setLocations(locationsData);
      setLoading(false);
    });

    // Bookings listener with error handling
    const bookingsQuery = query(collection(db, 'bookings'));
    const unsubscribeBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Safely parse total_amount, defaulting to 0 if invalid
          let totalAmount = 0;
          try {
            totalAmount = typeof data.total_amount === 'number' 
              ? data.total_amount 
              : parseFloat(data.total_amount) || 0;
          } catch (e) {
            console.warn(`Invalid total_amount for booking ${doc.id}:`, data.total_amount);
          }
          
          return {
            id: doc.id,
            start_time: data.start_time || '',
            end_time: data.end_time || '',
            total_amount: totalAmount,
            status: data.status || 'pending',
            profiles: {
              full_name: data.user_name || data.profiles?.full_name || 'User'
            },
            locations: {
              name: data.location_name || data.locations?.name || 'Location'
            },
          } as Booking;
        });
        setBookings(bookingsData);
      },
      (error) => {
        console.error('Error in bookings listener:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings. Please refresh the page.',
          variant: 'destructive',
        });
      }
    );

    // Cleanup function to unsubscribe from listeners
    return () => {
      unsubscribeLocations();
      unsubscribeBookings();
    };
  }, [toast]);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the location first
      const locationRef = await addDoc(collection(db, 'locations'), {
        name: newLocation.name,
        address: newLocation.address,
        total_slots: Number(newLocation.total_slots),
        available_slots: Number(newLocation.total_slots),
        pricing_per_hour: Number(newLocation.pricing_per_hour),
        created_at: serverTimestamp(),
      });
      
      console.log('Location created with ID:', locationRef.id);
      
      // Automatically generate slots based on total_slots entered
      const totalSlots = Number(newLocation.total_slots);
      await generateSlotsForLocation({
        locationId: locationRef.id,
        locationName: newLocation.name,
        pricePerHour: Number(newLocation.pricing_per_hour),
        numberOfSlots: totalSlots,
      });
      
      setNewLocation({
        name: '',
        address: '',
        total_slots: '',
        pricing_per_hour: '',
      });
      
      toast({
        title: 'Success',
        description: `Location and ${totalSlots} parking slots created successfully!`,
      });
    } catch (error: any) {
      console.error('Error adding location:', error);
      const errorMessage = error?.message || 'Failed to add location. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage.includes('permission') 
          ? 'Permission denied. Please make sure you are logged in as admin.'
          : errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setNewLocation({
      name: location.name,
      address: location.address,
      total_slots: location.total_slots.toString(),
      pricing_per_hour: location.pricing_per_hour.toString(),
    });
    // Scroll to the form
    document.getElementById('location-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    
    try {
      await updateDoc(doc(db, 'locations', editingLocation.id), {
        name: newLocation.name,
        address: newLocation.address,
        total_slots: Number(newLocation.total_slots),
        pricing_per_hour: Number(newLocation.pricing_per_hour),
      });
      
      setEditingLocation(null);
      setNewLocation({
        name: '',
        address: '',
        total_slots: '',
        pricing_per_hour: '',
      });
      
      toast({
        title: 'Success',
        description: 'Location updated successfully!',
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'locations', locationId));
      toast({
        title: 'Success',
        description: 'Location deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setNewLocation({
      name: '',
      address: '',
      total_slots: '',
      pricing_per_hour: '',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate total revenue from completed and active bookings
  const totalRevenue = React.useMemo(() => {
    return bookings
      .filter(booking => booking.status === 'completed' || booking.status === 'active')
      .reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0);
  }, [bookings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Locations Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>

          {/* Total Slots Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {locations.reduce((sum, loc) => sum + (loc.total_slots || 0), 0)}
              </div>
            </CardContent>
          </Card>

          {/* Active Bookings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="locations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-6">
            {/* Add Location Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </CardTitle>
                <CardDescription>
                  Create a new parking location for users to book
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form 
                  id="location-form"
                  onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation} 
                  className="w-full space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Location Name</Label>
                      <Input
                        id="name"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                        placeholder="Downtown Parking Garage"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                        placeholder="123 Main St, City, State"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="total_slots">Total Slots</Label>
                      <Input
                        id="total_slots"
                        type="number"
                        min="1"
                        max="1000"
                        value={newLocation.total_slots}
                        onChange={(e) => setNewLocation({...newLocation, total_slots: e.target.value})}
                        placeholder="10"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This many parking slots will be auto-generated (e.g., A1, A2, B1...)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="pricing">Price per Hour (₹)</Label>
                      <Input
                        id="pricing"
                        type="number"
                        step="0.01"
                        value={newLocation.pricing_per_hour}
                        onChange={(e) => setNewLocation({...newLocation, pricing_per_hour: e.target.value})}
                        placeholder="5.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit">
                      {editingLocation ? 'Update Location' : 'Create Location'}
                    </Button>
                    {editingLocation && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Locations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Parking Locations</CardTitle>
                <CardDescription>
                  Manage all parking locations in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Slots</TableHead>
                      <TableHead>Price/Hour</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {location.available_slots}/{location.total_slots}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{location.pricing_per_hour}</TableCell>
                        <TableCell>
                          {new Date(location.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditLocation(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLocation(location.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  View and manage all parking bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{booking.locations?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {new Date(booking.start_time).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.end_time).toLocaleString()}
                        </TableCell>
                        <TableCell>${booking.total_amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={booking.status === 'active' ? 'default' : 'secondary'}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

export default Admin;