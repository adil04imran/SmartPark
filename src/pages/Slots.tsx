import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SlotCard from '@/components/SlotCard';
import Navbar from '@/components/Navbar';
import { mockLocations, mockSlots } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
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

const Slots = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Find the location
  const location = mockLocations.find(loc => loc.id === parseInt(locationId || ''));
  const slots = mockSlots[parseInt(locationId || '')] || [];

  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Location Not Found</h1>
            <Button onClick={() => navigate('/locations')}>Back to Locations</Button>
          </div>
        </div>
      </div>
    );
  }

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const calculateCost = () => {
    const duration = calculateDuration();
    return duration * location.pricePerHour;
  };

  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const canProceedToBooking = () => {
    return selectedSlot && bookingDate && startTime && endTime && calculateDuration() > 0;
  };

  const handleProceedToBooking = () => {
    if (!canProceedToBooking()) {
      toast({
        title: "Incomplete Information",
        description: "Please select a slot and fill in all booking details.",
        variant: "destructive"
      });
      return;
    }

    const bookingData = {
      locationId: location.id,
      locationName: location.name,
      slotId: selectedSlot,
      date: bookingDate,
      startTime,
      endTime,
      duration: calculateDuration(),
      cost: calculateCost()
    };

    // Navigate to confirmation with booking data
    navigate('/booking-confirmation', { state: bookingData });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'electric charging':
        return <Zap className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/locations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{location.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {location.address}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {location.distance} away
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${location.pricePerHour}/hour
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {location.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Slots Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Available Parking Slots</span>
                  <Badge variant="outline">
                    {location.availableSlots} of {location.totalSlots} available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot === slot.id}
                      onSelect={slot.status === 'available' ? setSelectedSlot : undefined}
                    />
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium mb-3">Legend</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-success bg-success/10 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-warning bg-warning/10 rounded"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-destructive bg-destructive/10 rounded"></div>
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

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Slot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSlot ? (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Selected Slot</span>
                      <Badge className="bg-primary text-primary-foreground">
                        {selectedSlot}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg text-center text-muted-foreground">
                    Select a parking slot to continue
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Booking Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                {calculateDuration() > 0 && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{calculateDuration()} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per hour:</span>
                        <span>${location.pricePerHour}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Cost:</span>
                        <span className="text-primary">${calculateCost().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full btn-gradient" 
                  size="lg"
                  onClick={handleProceedToBooking}
                  disabled={!canProceedToBooking()}
                >
                  {selectedSlot ? 'Proceed to Booking' : 'Select a Slot First'}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  <p>Free cancellation up to 1 hour before start time</p>
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