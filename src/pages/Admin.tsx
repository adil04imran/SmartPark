import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthGuard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
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
  pricing_per_hour?: number;
  created_at?: any;
}

interface Booking {
  id: string;
  start_time: Date | null;
  end_time: Date | null;
  formatted_start_time: string;
  formatted_end_time: string;
  total_amount: number;
  status: string;
  user_name: string;
  location_name: string;
  userEmail: string;
  locationId: string;
}

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_slots: '',
    electric_slots: '0',
    pricing_per_hour: ''
  });

  // Format date helper function
  const formatDate = useCallback((date: Date | null): string => {
    if (!date) return 'N/A';
    try {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', date, e);
      return 'Invalid Date';
    }
  }, []);

  // Helper function to check if bookings collection exists and has data
  const checkBookingsCollection = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'bookings'));
      console.log('Bookings collection exists with', snapshot.size, 'documents');
      if (snapshot.size === 0) {
        console.log('No bookings found in the collection');
      } else {
        snapshot.forEach((doc: { id: string; data: () => DocumentData }) => {
          console.log('Document data:', doc.id, doc.data());
        });
      }
    } catch (error) {
      console.error('Error checking bookings collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to access bookings. Please check your connection and refresh.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    
    // Check bookings collection on initial load
    checkBookingsCollection();

    // Subscribe to locations
    const locationsQuery = query(collection(db, 'locations'), orderBy('name'));
    const unsubscribeLocations = onSnapshot(
      locationsQuery,
      (snapshot) => {
        const locationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Location));
        setLocations(locationsData);
      },
      (error) => {
        console.error('Error in locations listener:', error);
        toast({
          title: 'Error',
          description: 'Failed to load locations. Please refresh the page.',
          variant: 'destructive',
        });
      }
    );

    // Subscribe to bookings with proper timestamp handling and data mapping
    const unsubscribeBookings = onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        console.log('Received', snapshot.size, 'bookings from Firestore');
        
        const bookingsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Processing booking:', { id: doc.id, ...data });
          
          // Parse timestamps
          const startTime = data.startTimestamp?.toDate?.() || 
                           (data.startTime ? new Date(`${data.date}T${data.startTime}`) : null);
          
          const endTime = data.endTimestamp?.toDate?.() || 
                         (data.endTime ? new Date(`${data.date}T${data.endTime}`) : null);

          return {
            id: doc.id,
            start_time: startTime,
            end_time: endTime,
            formatted_start_time: startTime ? formatDate(startTime) : 'N/A',
            formatted_end_time: endTime ? formatDate(endTime) : 'N/A',
            total_amount: data.totalPrice || 0,
            status: data.status || 'pending',
            user_name: data.userName || 'User',
            location_name: data.locationName || 'Location',
            userEmail: data.userEmail || '',
            locationId: data.locationId || '',
            slotId: data.slotId || '',
            slotNumber: data.slotNumber || '',
            date: data.date || ''
          } as Booking;
        });
        
        console.log('Processed bookings:', bookingsData);
        setBookings(bookingsData);
        
        // Calculate total revenue
        const revenue = bookingsData.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
        setTotalRevenue(revenue);
        
        setLoading(false);
      },
      (error) => {
        console.error('Error in bookings listener:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bookings. ' + 
            (error.code === 'permission-denied' 
              ? 'Permission denied. Please sign in again.' 
              : 'Please check your connection and refresh.'),
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from listeners
    return () => {
      try {
        if (typeof unsubscribeLocations === 'function') {
          unsubscribeLocations();
        }
        if (typeof unsubscribeBookings === 'function') {
          unsubscribeBookings();
        }
      } catch (e) {
        console.error('Error during cleanup:', e);
      }
    };
  }, [formatDate, toast]);

  // Debug useEffect to log all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'bookings'));
        console.log('All booking documents:');
        snapshot.forEach((doc) => {
          console.log('Document ID:', doc.id, 'Data:', doc.data());
        });
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    
    fetchBookings();
  }, []);

  // Add a test booking function for debugging
  // This function is exposed to the window object for testing
  // You can call it from the browser console using: window.addTestBooking()
  const addTestBooking = async () => {
    try {
      const newBooking = {
        start_time: serverTimestamp(),
        end_time: new Date(Date.now() + 3600000), // 1 hour from now
        total_amount: 15.99,
        status: 'active',
        user_name: 'Test User',
        location_name: 'Test Location',
        userEmail: 'test@example.com',
        locationId: 'test-location-123',
        created_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      console.log('Test booking added with ID:', docRef.id);
      
      toast({
        title: 'Success',
        description: 'Test booking added successfully!',
      });
    } catch (error) {
      console.error('Error adding test booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to add test booking: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalSlots = Number(newLocation.total_slots);
    const electricSlots = Number(newLocation.electric_slots) || 0;
    
    if (electricSlots > totalSlots) {
      toast({
        title: 'Error',
        description: 'Number of electric slots cannot exceed total number of slots',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // First, create the location
      const locationRef = await addDoc(collection(db, 'locations'), {
        name: newLocation.name,
        address: newLocation.address,
        total_slots: totalSlots,
        electric_slots: electricSlots,
        available_slots: totalSlots,
        pricing_per_hour: Number(newLocation.pricing_per_hour),
        created_at: serverTimestamp(),
      });

      // Create slots for the location
      const batch = writeBatch(db);
      const slotsRef = collection(db, 'slots');
      
      // Determine how many slots per floor (assuming 10 slots per floor)
      const slotsPerFloor = 10;
      const totalFloors = Math.ceil(totalSlots / slotsPerFloor);
      
      let slotCount = 1;
      let electricSlotsAssigned = 0;
      
      // Create slots for each floor
      for (let floor = 1; floor <= totalFloors; floor++) {
        const slotsThisFloor = Math.min(slotsPerFloor, totalSlots - ((floor - 1) * slotsPerFloor));
        
        for (let i = 1; i <= slotsThisFloor; i++) {
          const slotRef = doc(slotsRef);
          const slotNumber = `${String.fromCharCode(64 + floor)}${i}`; // A1, A2, ..., B1, B2, etc.
          
          // Determine if this should be an electric slot
          const isElectric = electricSlotsAssigned < electricSlots && 
                           (slotCount % Math.ceil(totalSlots / electricSlots) === 0 || 
                            electricSlots - electricSlotsAssigned >= totalSlots - slotCount + 1);
          
          if (isElectric) {
            electricSlotsAssigned++;
          }
          
          // Set slot type
          const slotType = isElectric ? 'electric' : 'standard';
          
          batch.set(slotRef, {
            id: slotRef.id,
            locationId: locationRef.id,
            locationName: newLocation.name,
            number: slotNumber,
            floor: floor,
            type: slotType,
            status: 'available',
            pricePerHour: Number(newLocation.pricing_per_hour),
            isAvailable: true,
            isElectric: isElectric,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Add more explicit type information
            slotType: slotType, // Add this line to ensure type is properly set
            slotNumber: slotNumber,
            location_id: locationRef.id,
            location_name: newLocation.name,
            price_per_hour: Number(newLocation.pricing_per_hour),
            is_available: true,
            is_electric: isElectric // Add this line for explicit electric flag
          });
          
          console.log(`Created slot:`, {
            number: slotNumber,
            type: slotType,
            isElectric: isElectric,
            floor: floor,
            price: newLocation.pricing_per_hour
          });
          
          slotCount++;
        }
      }
      
      await batch.commit();

      // Reset form
      setNewLocation({
        name: '',
        address: '',
        total_slots: '',
        electric_slots: '0',
        pricing_per_hour: ''
      });

      toast({
        title: 'Success',
        description: `Location and ${totalSlots} slots created successfully!`,
      });
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Error',
        description: 'Failed to add location. Please try again.',
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
      electric_slots: (location as any).electric_slots?.toString() || '0',
      pricing_per_hour: location.pricing_per_hour?.toString() || ''
    });
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      await updateDoc(doc(db, 'locations', editingLocation.id), {
        name: newLocation.name,
        address: newLocation.address,
        total_slots: Number(newLocation.total_slots),
        electric_slots: Number(newLocation.electric_slots),
        pricing_per_hour: Number(newLocation.pricing_per_hour),
      });

      setEditingLocation(null);
      setNewLocation({
        name: '',
        address: '',
        total_slots: '',
        electric_slots: '0',
        pricing_per_hour: ''
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
    if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
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
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setNewLocation({
      name: '',
      address: '',
      total_slots: '',
      electric_slots: '0',
      pricing_per_hour: ''
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600 text-center max-w-md">
            Fetching the latest booking data from our servers...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (bookings.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Yet</h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Once users start making bookings, they'll appear here. The system is ready to receive new reservations.
          </p>
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p>ℹ️ Ensure your Firestore rules allow reading from the 'bookings' collection.</p>
          </div>
        </div>
      </PageLayout>
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

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {locations.reduce((sum, loc) => sum + (loc.available_slots || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

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
              </CardHeader>
              <CardContent>
                <form onSubmit={editingLocation ? handleUpdateLocation : handleAddLocation} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Location Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter location name"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter address"
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="slots">Total Slots</Label>
                        <Input
                          id="slots"
                          type="number"
                          placeholder="Number of slots"
                          min="1"
                          value={newLocation.total_slots}
                          onChange={(e) => setNewLocation({...newLocation, total_slots: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electric_slots">Electric Slots</Label>
                        <Input
                          id="electric_slots"
                          type="number"
                          placeholder="Number of electric slots"
                          min="0"
                          max={newLocation.total_slots || '0'}
                          value={newLocation.electric_slots}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (Number(value) >= 0 && Number(value) <= Number(newLocation.total_slots || 0))) {
                              setNewLocation({...newLocation, electric_slots: value});
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price per Hour ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        min="0"
                        value={newLocation.pricing_per_hour}
                        onChange={(e) => setNewLocation({...newLocation, pricing_per_hour: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    {editingLocation && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit">
                      {editingLocation ? 'Update Location' : 'Add Location'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Locations List */}
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
                      <TableHead className="text-right">Slots</TableHead>
                      <TableHead className="text-right">Price/Hour</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell className="text-right">
                          {location.available_slots} / {location.total_slots}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{location.pricing_per_hour?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
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
                            onClick={() => handleDeleteLocation(location.id)}
                            className="text-red-600 hover:text-red-700"
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
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.user_name}
                          <div className="text-sm text-muted-foreground">
                            {booking.userEmail}
                          </div>
                        </TableCell>
                        <TableCell>{booking.location_name}</TableCell>
                        <TableCell>{booking.formatted_start_time}</TableCell>
                        <TableCell>{booking.formatted_end_time}</TableCell>
                        <TableCell className="text-right">
                          ₹{booking.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === 'completed'
                                ? 'default'
                                : booking.status === 'active'
                                ? 'secondary'
                                : 'outline'
                            }
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
};

export default Admin;