import { Calendar, Clock, MapPin, DollarSign, Car } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: {
    id: string;
    locationName: string;
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalCost: number;
    status: 'active' | 'completed' | 'cancelled';
  };
  onViewDetails?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

const BookingCard = ({ booking, onViewDetails, onCancel }: BookingCardProps) => {
  const getStatusColor = () => {
    switch (booking.status) {
      case 'active':
        return 'status-available';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'status-booked';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (booking.status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return booking.status;
    }
  };

  const bookingDate = new Date(booking.date);
  const isUpcoming = booking.status === 'active' && bookingDate > new Date();
  const canCancel = booking.status === 'active' && isUpcoming;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{booking.locationName}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Car className="h-4 w-4 mr-2" />
              Slot {booking.slotId}
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(bookingDate, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Duration:</span>
              <span className="font-medium">{booking.duration}h</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-semibold text-primary">${booking.totalCost}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex gap-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(booking.id)}
                className="flex-1"
              >
                View Details
              </Button>
            )}
            {canCancel && onCancel && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;