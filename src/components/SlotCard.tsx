import { Car, Zap, Accessibility } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SlotStatus = 'available' | 'booked' | 'reserved' | 'maintenance';

export interface SlotCardProps {
  slot: {
    id: string;
    status?: SlotStatus;
    type: 'standard' | 'compact' | 'electric' | 'handicap';
    number?: string | number;
    floor?: number;
    pricePerHour?: number;
    isMovieThemed?: boolean;
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
    const status = slot.status || 'available'; // Default to 'available' if status is undefined
    
    switch (status) {
      case 'available':
        return 'border-green-500 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30';
      case 'reserved':
        return 'border-yellow-500 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30';
      case 'booked':
      case 'maintenance':
        return 'border-red-500 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 cursor-not-allowed';
      default:
        return 'border-border bg-muted';
    }
  };

  const getTypeLabel = () => {
    // Only show label for electric slots
    if (slot.type === 'electric') {
      return 'Electric';
    }
    return ''; // Return empty string for all other slot types
  };

  // Ensure status has a default value of 'available' if undefined
  const status = slot.status || 'available';
  const isDisabled = status !== 'available';

  return (
    <div className="h-full w-full p-1">
      <Card
        className={cn(
          'h-full w-full flex flex-col items-center justify-between transition-all border-2 overflow-hidden',
          getStatusColor(),
          isSelected && 'ring-2 ring-blue-500 ring-offset-2',
          !isDisabled && 'cursor-pointer hover:shadow-md',
          isDisabled && 'opacity-70 cursor-not-allowed'
        )}
        onClick={() => !isDisabled && onSelect?.(slot.id)}
      >
        <div className="w-full px-2 pt-2 flex justify-between items-start">
          <div className="flex items-center gap-1">
            {getSlotIcon()}
            <span className="text-xs font-medium">
              {slot.floor ? `F${slot.floor}` : ''}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-[10px] h-5 px-1.5',
              slot.status === 'maintenance' && 'bg-destructive/10 text-destructive border-destructive/20'
            )}
          >
            {slot.status === 'maintenance' ? 'Maint' : getTypeLabel().substring(0, 4)}
          </Badge>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full px-2">
          <h4 className="text-lg font-bold">
            {slot.number || `F${slot.floor || 'N'}-${slot.id.slice(0, 3)}`}
          </h4>
          <div className="text-xs text-muted-foreground">
            ₹{slot.pricePerHour || '0'}/hr
          </div>
        </div>
        
        <div className="w-full px-2 pb-1">
          <Badge 
            variant={status === 'available' ? 'default' : 'secondary'} 
            className={cn(
              'w-full justify-center text-xs font-normal rounded-t-none rounded-b-sm',
              status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default SlotCard;