import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PageLayout from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { BookingQRCode } from '@/components/BookingQRCode';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Car, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const bookingData = location.state;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!bookingData) {
    const header = (
      <>
        <h1 className="text-2xl font-bold text-foreground mb-2">No Booking Data Found</h1>
        <p className="text-muted-foreground">Please select a parking spot to book</p>
      </>
    );

    return (
      <PageLayout header={header}>
        <div className="text-center py-12">
          <Button onClick={() => navigate('/locations')}>Back to Locations</Button>
        </div>
      </PageLayout>
    );
  }

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set booking as confirmed to show the QR code
      setBookingConfirmed(true);
      
      toast({
        title: 'Booking Confirmed!',
        description: 'Your parking spot has been successfully booked.',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const header = (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-2">Confirm Your Booking</h1>
      <p className="text-muted-foreground">Review your booking details and complete payment</p>
    </>
  );

  // Show QR code if booking is confirmed
  if (bookingConfirmed) {
    return (
      <PageLayout className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">Your parking spot is reserved. Show this QR code at the entrance.</p>
          </div>
          
          <BookingQRCode
            bookingId={bookingData.bookingId || `temp-${Date.now()}`}
            bookingData={{
              locationName: bookingData.locationName,
              slotNumber: bookingData.slotNumber,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              vehicleNumber: bookingData.vehicleNumber || 'Not specified',
            }}
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/bookings')}
            >
              View My Bookings
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show payment form if booking is not confirmed yet
  return (
    <PageLayout className="max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location & Slot Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Parking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{bookingData.locationName}</h3>
                    <p className="text-muted-foreground">Downtown Area</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Badge className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Slot {bookingData.slotId}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">{formatDate(bookingData.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{bookingData.startTime} - {bookingData.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{bookingData.duration} hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Digital Wallet</p>
                        <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input id="expiryDate" placeholder="MM/YY" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Parking fee ({bookingData.duration}h)</span>
                    <span>${bookingData.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>$2.00</span>
                  </div>
                  <div className="flex justify-between text-success">
                    <span>Early bird discount</span>
                    <span>-$1.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">${(bookingData.cost + 1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Free cancellation until 1 hour before</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>24/7 customer support</span>
                  </div>
                </div>

                <Button 
                  className="w-full btn-gradient" 
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By confirming, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookingConfirmation;