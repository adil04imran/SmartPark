import { MapPin, Clock, DollarSign, Star, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationCardProps {
  location: {
    id: number;
    name: string;
    address: string;
    distance: string;
    totalSlots: number;
    availableSlots: number;
    pricePerHour: number;
    amenities: string[];
  };
  onSelect: (locationId: number) => void;
}

const LocationCard = ({ location, onSelect }: LocationCardProps) => {
  const availabilityStatus = () => {
    const percentage = (location.availableSlots / location.totalSlots) * 100;
    if (percentage > 30) return { status: 'available', color: 'status-available' };
    if (percentage > 10) return { status: 'limited', color: 'status-limited' };
    return { status: 'full', color: 'status-booked' };
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'security':
        return <Shield className="h-3 w-3" />;
      case 'electric charging':
        return <Zap className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const { status, color } = availabilityStatus();

  return (
    <Card className="card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {location.name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {location.address}
            </div>
          </div>
          <Badge variant="outline" className={color}>
            {location.availableSlots} available
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location.distance}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>${location.pricePerHour}/hr</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Total Slots</span>
            <div className="font-semibold">{location.totalSlots}</div>
          </div>
        </div>

        {/* Amenities */}
        {location.amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Amenities</p>
            <div className="flex flex-wrap gap-1">
              {location.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  {amenity}
                </Badge>
              ))}
              {location.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{location.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          className="w-full btn-gradient" 
          onClick={() => onSelect(location.id)}
          disabled={status === 'full'}
        >
          {status === 'full' ? 'No Slots Available' : 'View Slots'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationCard;