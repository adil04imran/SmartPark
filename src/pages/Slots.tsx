import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { SlotStatus } from '@/components/SlotCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import SlotCard from '@/components/SlotCard';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  total_slots: number;
  available_slots: number;
  pricing_per_hour: number;
  amenities?: string[];
}

interface Slot {
  id: string;
  number: string;
  status: SlotStatus;
  type: 'standard' | 'compact' | 'electric' | 'handicap';
  locationId: string;
  pricePerHour: number;
  floor?: number;
  isMovieThemed?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const Slots = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (!locationId) return;

    const fetchLocation = async () => {
      try {
        const locationDoc = await getDoc(doc(db, 'locations', locationId));
        if (locationDoc.exists()) {
          const locationData = locationDoc.data() as Omit<Location, 'id'>;
          setLocation({ id: locationDoc.id, ...locationData });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        toast({
          title: 'Error',
          description: 'Failed to load location details.',
          variant: 'destructive',
        });
      }
    };

    console.log('Fetching slots for location:', locationId);
    const q = query(
      collection(db, 'slots'), 
      where('locationId', '==', locationId)
    );
    
    const unsubscribeSlots = onSnapshot(q,
      (snapshot) => {
        if (snapshot.empty) {
          console.log('No slots found for this location');
          setSlots([]);
          setLoading(false);
          return;
        }
        
        const slotsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`Slot ${doc.id} data:`, data);
          
          const status: SlotStatus = 
            data.status === 'available' || 
            data.status === 'booked' || 
            data.status === 'reserved' ||
            data.status === 'maintenance' 
              ? data.status 
              : 'available';
              
          return {
            id: doc.id,
            number: data.number || 'Unknown',
            status,
            type: data.type || 'standard',
            locationId: data.locationId,
            pricePerHour: data.pricePerHour || 0,
            floor: data.floor,
            isMovieThemed: data.isMovieThemed || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          } as Slot;
        });
        
        console.log('Processed slots data:', slotsData);
        setSlots(slotsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching slots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load parking slots.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    fetchLocation();
    return () => unsubscribeSlots();
  }, [locationId, toast]);

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast({
        title: 'No slot selected',
        description: 'Please select a parking slot first.',
        variant: 'destructive',
      });
      return;
    }

    if (!bookingDate) {
      toast({
        title: 'No date selected',
        description: 'Please select a booking date.',
        variant: 'destructive',
      });
      return;
    }

    if (!startTime || !endTime) {
      toast({
        title: 'Time not selected',
        description: 'Please select both start and end times.',
        variant: 'destructive',
      });
      return;
    }

    const selectedSlotData = slots.find(s => s.id === selectedSlot);
    if (!selectedSlotData) return;

    try {
      // Create booking document
      const bookingData = {
        slotId: selectedSlot,
        slotNumber: selectedSlotData.number,
        locationId: locationId,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || 'Guest',
        userEmail: auth.currentUser?.email,
        date: bookingDate,
        startTime,
        endTime,
        pricePerHour: selectedSlotData.pricePerHour,
        totalPrice: calculateTotalPrice(selectedSlotData.pricePerHour, startTime, endTime),
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Update slot status
      await updateDoc(doc(db, 'slots', selectedSlot), {
        status: 'booked',
        updatedAt: new Date()
      });

      toast({
        title: 'Booking confirmed!',
        description: `Your booking for slot ${selectedSlotData.number} has been confirmed.`,
      });

      // Reset form
      setSelectedSlot(null);
      setBookingDate('');
      setStartTime('');
      setEndTime('');

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const calculateTotalPrice = (pricePerHour: number, startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    let totalMinutes = endTotalMinutes - startTotalMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight
    
    const hours = Math.ceil(totalMinutes / 60);
    return hours * pricePerHour;
  };

  const availableSlots = slots.filter(s => s.status === 'available').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Slots */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Available Parking Slots</h2>
                    <p className="text-muted-foreground">
                      {availableSlots} of {slots.length} available
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {slots.map((slot) => (
                      <div 
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot.id)}
                        className={cn(
                          'cursor-pointer transition-all',
                          selectedSlot === slot.id && 'ring-2 ring-primary rounded-lg'
                        )}
                      >
                        <SlotCard
                          slot={{
                            id: slot.id,
                            number: slot.number,
                            status: slot.status,
                            type: slot.type,
                            floor: slot.floor,
                            pricePerHour: slot.pricePerHour,
                            isMovieThemed: slot.isMovieThemed
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No parking slots available at this location.</p>
                  </div>
                )}
                
                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium mb-3">Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 bg-green-100 dark:bg-green-900/20 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 rounded"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 bg-red-100 dark:bg-red-900/20 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary bg-primary/10 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Selected Slot</h4>
                    {selectedSlot ? (
                      <div className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {slots.find(s => s.id === selectedSlot)?.number || 'N/A'}
                          </span>
                          <Badge variant="outline">
                            {slots.find(s => s.id === selectedSlot)?.type || 'Standard'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Floor: {slots.find(s => s.id === selectedSlot)?.floor || 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed p-4 rounded-lg text-center text-muted-foreground">
                        No slot selected
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bookingDate">Booking Date</Label>
                      <div className="relative mt-1">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="bookingDate"
                          type="date"
                          className="pl-10"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <div className="relative mt-1">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="startTime"
                            type="time"
                            className="pl-10"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <div className="relative mt-1">
                          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="endTime"
                            type="time"
                            className="pl-10"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleBooking}
                        disabled={!selectedSlot || !bookingDate || !startTime || !endTime}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;
