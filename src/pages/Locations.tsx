import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LocationCard from '@/components/LocationCard';
import Navbar from '@/components/Navbar';
import { mockLocations } from '@/data/mockData';
import { Search, Map, List, Filter, SlidersHorizontal } from 'lucide-react';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigate = useNavigate();

  const filteredLocations = mockLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'available') {
      return matchesSearch && location.availableSlots > 10;
    } else if (selectedFilter === 'limited') {
      return matchesSearch && location.availableSlots <= 10 && location.availableSlots > 0;
    }
    
    return matchesSearch;
  });

  const handleLocationSelect = (locationId: number) => {
    navigate(`/slots/${locationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Parking</h1>
          <p className="text-muted-foreground">Discover available parking spots near your destination</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All Locations
            </Button>
            <Button
              variant={selectedFilter === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('available')}
            >
              Good Availability
            </Button>
            <Button
              variant={selectedFilter === 'limited' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('limited')}
            >
              Limited Spots
            </Button>
          </div>
        </div>

        {/* Results */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {filteredLocations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onSelect={handleLocationSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No parking locations found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Map View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Interactive Map</p>
                    <p className="text-sm">Google Maps integration would appear here</p>
                    <p className="text-xs mt-2">Showing {filteredLocations.length} locations</p>
                  </div>
                </div>
                
                {/* Map Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span>Good Availability (10+ spots)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span>Limited Spots (1-9 spots)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span>Full</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {filteredLocations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{filteredLocations.length}</div>
                <div className="text-sm text-muted-foreground">Locations Found</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {filteredLocations.reduce((sum, loc) => sum + loc.availableSlots, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Available Spots</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  ${Math.min(...filteredLocations.map(loc => loc.pricePerHour))}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Price/hr</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {Math.min(...filteredLocations.map(loc => parseFloat(loc.distance)))}km
                </div>
                <div className="text-sm text-muted-foreground">Closest Distance</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;