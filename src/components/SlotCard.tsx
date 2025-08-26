import { Car, Zap, Accessibility } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SlotCardProps {
  slot: {
    id: string;
    status: 'available' | 'booked' | 'reserved';
    type: 'standard' | 'compact' | 'electric' | 'handicap';
  };
  isSelected?: boolean;
  onSelect?: (slotId: string) => void;
}

const SlotCard = ({ slot, isSelected = false, onSelect }: SlotCardProps) => {
  const getSlotIcon = () => {
    switch (slot.type) {
      case 'electric':
        return <Zap className="h-4 w-4" />;
      case 'handicap':
        return <Accessibility className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (slot.status) {
      case 'available':
        return 'status-available';
      case 'reserved':
        return 'status-limited';
      case 'booked':
        return 'status-booked';
      default:
        return 'border-border';
    }
  };

  const getTypeLabel = () => {
    switch (slot.type) {
      case 'electric':
        return 'Electric';
      case 'handicap':
        return 'Accessible';
      case 'compact':
        return 'Compact';
      default:
        return 'Standard';
    }
  };

  const isClickable = slot.status === 'available' && onSelect;

  return (
    <Card 
      className={cn(
        'transition-all duration-200 border-2',
        getStatusColor(),
        isSelected && 'ring-2 ring-primary shadow-glow',
        isClickable && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        !isClickable && 'opacity-60 cursor-not-allowed'
      )}
      onClick={() => isClickable && onSelect(slot.id)}
    >
      <CardContent className="p-4 text-center space-y-2">
        <div className="flex items-center justify-center">
          {getSlotIcon()}
        </div>
        
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">{slot.id}</h4>
          <Badge 
            variant={slot.status === 'available' ? 'default' : 'secondary'} 
            className="text-xs"
          >
            {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground">{getTypeLabel()}</p>
      </CardContent>
    </Card>
  );
};

export default SlotCard;