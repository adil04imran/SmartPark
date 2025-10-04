import { MapPin, Clock, DollarSign, Star, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface LocationCardLocation {
  id: string;
  name: string;
  address: string;
  total_slots: number;
  available_slots: number;
  pricing_per_hour: number;
  distance?: string;
  amenities?: string[];
}

interface LocationCardProps {
  location: LocationCardLocation;
  onSelect: (locationId: string) => void;
}

const LocationCard = ({ location, onSelect }: LocationCardProps) => {
  const availabilityStatus = () => {
    // Ensure we don't divide by zero
    const totalSlots = location.total_slots || 1;
    const availableSlots = location.available_slots || 0;
    const percentage = (availableSlots / totalSlots) * 100;
    
    if (percentage > 30) return { status: 'Good Availability', color: 'bg-green-100 text-green-800' };
    if (percentage > 10) return { status: 'Limited Spots', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Fully Booked', color: 'bg-red-100 text-red-800' };
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
  const amenities = location.amenities || [];

  return (
    <Card className="card-hover group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {location.name}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{location.address}</span>
            </div>
          </div>
          <Badge variant="outline" className={color}>
            {location.available_slots} available
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>24/7</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>${location.pricing_per_hour}/hr</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Total Slots</span>
            <div className="font-semibold">{location.total_slots}</div>
          </div>
        </div>

        {/* Amenities */}
        {location.amenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Amenities</p>
            {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {getAmenityIcon(amenity)}
                  {amenity}
                </Badge>
              ))}
            </div>
          )}
              {location.amenities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{location.amenities.length - 3} more
                </Badge>
              )}
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