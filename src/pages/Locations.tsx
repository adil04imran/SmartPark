import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import LocationCard from '@/components/LocationCard';
import PageLayout from '@/components/layout/PageLayout';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Skeleton } from '@/components/ui/skeleton';

interface Location {
  id: string;
  name: string;
  address: string;
  total_slots: number;
  available_slots: number;
  pricing_per_hour: number;
  created_at: string;
}

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  const filterOptions = [
    { id: 'all', label: 'All Locations' },
    { id: 'available', label: 'Good Availability' },
    { id: 'limited', label: 'Limited Spots' }
  ];

  // Fetch locations from Firestore
  useEffect(() => {
    const locationsQuery = query(
      collection(db, 'locations'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(locationsQuery, (snapshot) => {
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        address: doc.data().address || '',
        total_slots: doc.data().total_slots || 0,
        available_slots: doc.data().available_slots || 0,
        pricing_per_hour: doc.data().pricing_per_hour || 0,
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      setLocations(locationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLocations = locations.filter((location: Location) => {
    if (!location) return false;
    
    const matchesSearch = location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'available') {
      return matchesSearch && (location.available_slots || 0) > 10;
    } else if (selectedFilter === 'limited') {
      return matchesSearch && (location.available_slots || 0) <= 10 && (location.available_slots || 0) > 0;
    }
    
    return matchesSearch;
  });

  const handleLocationSelect = (locationId: string) => {
    if (locationId) {
      navigate(`/slots/${locationId}`);
    }
  };

  const header = (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Find Parking</h1>
      <p className="text-sm sm:text-base text-muted-foreground">Discover available parking spots near your destination</p>
    </>
  );

  return (
    <PageLayout header={header}>
      {/* Content */}

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.id}
                      onClick={() => setSelectedFilter(option.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.label}</span>
                      {selectedFilter === option.id && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Results */}
          <div className="w-full mt-4 sm:mt-6">
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredLocations.map((location) => (location && (
                  <LocationCard
                    key={location.id}
                    location={{
                      id: location.id,
                      name: location.name,
                      address: location.address,
                      total_slots: location.total_slots,
                      available_slots: location.available_slots,
                      pricing_per_hour: location.pricing_per_hour,
                      amenities: ['24/7 Access', 'Security Cameras']
                    }}
                    onSelect={handleLocationSelect}
                  />
                )))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No parking locations found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {filteredLocations.length > 0 && (
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-4">
              <Card className="h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <div className="text-2xl font-bold text-primary">{filteredLocations.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">Locations Found</div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <div className="text-2xl font-bold text-success">
                    {filteredLocations.reduce((sum, loc) => sum + (loc.available_slots || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Available Spots</div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <div className="text-2xl font-bold text-amber-500">
                    ₹{filteredLocations.length > 0 
                      ? Math.min(...filteredLocations.map(loc => loc.pricing_per_hour || 0)).toFixed(2)
                      : '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Lowest Price/hr</div>
                </CardContent>
              </Card>
            </div>
          )}
    </PageLayout>
  );
};

export default Locations;