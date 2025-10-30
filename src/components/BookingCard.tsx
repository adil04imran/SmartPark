import { Calendar, Clock, Car } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: {
    id: string;
    locationName: string;
    slotId: string;
    slotNumber?: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalCost: number;
    status: 'active' | 'completed' | 'cancelled' | 'confirmed';
  };
  onCancel?: (bookingId: string) => void;
}

const BookingCard = ({ booking, onCancel }: BookingCardProps) => {
  const getStatusColor = () => {
    const status = booking.status === 'confirmed' ? 'active' : booking.status;
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = () => {
    const status = booking.status === 'confirmed' ? 'active' : booking.status;
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Active';
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  const bookingDate = new Date(booking.date);
  const actualStatus = booking.status === 'confirmed' ? 'active' : booking.status;
  const isUpcoming = actualStatus === 'active' && bookingDate > new Date();
  const canCancel = actualStatus === 'active' && isUpcoming;

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {booking.locationName === 'Unknown Location' ? 'Parking Location' : booking.locationName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Car className="h-4 w-4 mr-2" />
              Slot {booking.slotNumber || booking.slotId}
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
              <span className="font-medium">{formatDuration(booking.duration)}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-muted-foreground">₹</span>
              <span className="font-semibold text-primary">{booking.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          {onCancel && (
            <div className="flex justify-end pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onCancel(booking.id)}
                disabled={!canCancel}
                className="w-full"
              >
                Cancel Booking
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  export default BookingCard;