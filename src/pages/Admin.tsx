import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthGuard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getDocs, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    total_slots: '',
    pricing_per_hour: ''
  });
  const { currentUser, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch locations from Firestore
      const locationsSnapshot = await getDocs(collection(db, 'locations'));
      const locationsData = locationsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        address: doc.data().address || '',
        total_slots: doc.data().total_slots || 0,
        available_slots: doc.data().available_slots || 0,
        pricing_per_hour: doc.data().pricing_per_hour || 0,
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Location[];

      // Fetch bookings from Firestore
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const bookingsData = await Promise.all(
        bookingsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            start_time: data.start_time || '',
            end_time: data.end_time || '',
            total_amount: data.total_amount || 0,
            status: data.status || 'pending',
            profiles: { full_name: 'User' },
            locations: { name: 'Location' },
          } as Booking;
        })
      );

      setLocations(locationsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const docRef = await addDoc(collection(db, 'locations'), {
        name: newLocation.name,
        address: newLocation.address,
        total_slots: Number(newLocation.total_slots),
        available_slots: Number(newLocation.total_slots), // Initially all slots are available
        pricing_per_hour: Number(newLocation.pricing_per_hour),
        created_at: serverTimestamp(),
      });

      setLocations([...locations, {
        id: docRef.id,
        name: newLocation.name,
        address: newLocation.address,
        total_slots: Number(newLocation.total_slots),
        available_slots: Number(newLocation.total_slots),
        pricing_per_hour: Number(newLocation.pricing_per_hour),
        created_at: new Date().toISOString(),
      }]);
      
      setNewLocation({
        name: '',
        address: '',
        total_slots: '',
        pricing_per_hour: '',
      });
      
      toast({
        title: 'Success',
        description: 'Location added successfully!',
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary rounded-lg">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SmartPark Admin</h1>
              <p className="text-muted-foreground">Manage locations and bookings</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {currentUser?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {locations.reduce((sum, loc) => sum + loc.total_slots, 0)}
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0).toFixed(2)}
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
                  Add New Location
                </CardTitle>
                <CardDescription>
                  Create a new parking location for users to book
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLocation} className="w-full space-y-4">
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
                        value={newLocation.total_slots}
                        onChange={(e) => setNewLocation({...newLocation, total_slots: e.target.value})}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricing">Price per Hour ($)</Label>
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
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Location
                  </Button>
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
                        <TableCell>${location.pricing_per_hour}</TableCell>
                        <TableCell>
                          {new Date(location.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
    </div>
  );
};

export default Admin;