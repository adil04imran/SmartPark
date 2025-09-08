import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Star, ArrowRight, Filter, Search, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

type Location = {
  id: number;
  name: string;
  address: string;
  distance: string;
  rate: string;
  rating: number;
  image: string;
  spots: number;
  features: string[];
  isFavorite: boolean;
};

type FilterOption = {
  id: string;
  name: string;
  options: { value: string; label: string; count: number }[];
};

export default function PopularLocations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const locations: Location[] = [
    {
      id: 1,
      name: 'Downtown Mall',
      address: '123 Main St, City Center',
      distance: '0.5 miles away',
      rate: '$3.50/hr',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      spots: 12,
      features: ['Covered', '24/7 Access', 'EV Charging'],
      isFavorite: false
    },
    {
      id: 2,
      name: 'Central Station',
      address: '456 Transit Ave, Downtown',
      distance: '1.2 miles away',
      rate: '$4.00/hr',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1453&q=80',
      spots: 8,
      features: ['Valet', 'Car Wash', '24/7 Access'],
      isFavorite: true
    },
    {
      id: 3,
      name: 'Riverside Park',
      address: '789 River Rd, Waterfront',
      distance: '2.1 miles away',
      rate: '$2.50/hr',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      spots: 15,
      features: ['Open Air', 'Scenic View', 'Bike Racks'],
      isFavorite: false
    },
    {
      id: 4,
      name: 'Tech Hub',
      address: '101 Innovation Blvd',
      distance: '3.0 miles away',
      rate: '$3.75/hr',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      spots: 5,
      features: ['EV Charging', 'Secure', '24/7 Access'],
      isFavorite: true
    },
    {
      id: 5,
      name: 'University Campus',
      address: '200 College Ave',
      distance: '2.5 miles away',
      rate: '$2.00/hr',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      spots: 20,
      features: ['Student Discount', 'Bike Racks', '24/7 Access'],
      isFavorite: false
    },
    {
      id: 6,
      name: 'Shopping District',
      address: '300 Retail Way',
      distance: '1.8 miles away',
      rate: '$4.00/hr',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      spots: 10,
      features: ['Validated Parking', 'Mall Access', '24/7 Security'],
      isFavorite: false
    }
  ];

  const filterOptions: FilterOption[] = [
    {
      id: 'features',
      name: 'Features',
      options: [
        { value: 'ev', label: 'EV Charging', count: 2 },
        { value: 'covered', label: 'Covered', count: 3 },
        { value: 'valet', label: 'Valet', count: 1 },
        { value: '24/7', label: '24/7 Access', count: 4 },
      ],
    },
    {
      id: 'price',
      name: 'Price Range',
      options: [
        { value: '0-2', label: 'Under $2/hr', count: 1 },
        { value: '2-3', label: '$2 - $3/hr', count: 2 },
        { value: '3-4', label: '$3 - $4/hr', count: 2 },
        { value: '4+', label: 'Over $4/hr', count: 1 },
      ],
    },
    {
      id: 'rating',
      name: 'Rating',
      options: [
        { value: '4.5+', label: '4.5+ stars', count: 3 },
        { value: '4.0+', label: '4.0+ stars', count: 5 },
        { value: '3.5+', label: '3.5+ stars', count: 6 },
      ],
    },
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const filteredLocations = locations.filter(location => {
    // Search filter
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Feature filters
    const matchesFeatures = activeFilters.length === 0 || 
                          activeFilters.some(filter => 
                            location.features.some(feature => 
                              feature.toLowerCase().includes(filter.toLowerCase())
                            )
                          );
    
    return matchesSearch && matchesFeatures;
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Find Your Perfect Parking Spot
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and reserve parking spots across the city with real-time availability and the best rates
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by location, address, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600"
            >
              <Filter className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-1.5 py-0.5 px-1.5 bg-indigo-100 text-xs text-indigo-800 rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filterOptions.map((section) => (
                      <div key={section.id}>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">{section.name}</h4>
                        <div className="space-y-2">
                          {section.options.map((option, optionIdx) => {
                            const isActive = activeFilters.includes(option.value);
                            return (
                              <div key={option.value} className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => toggleFilter(option.value)}
                                  className={`flex items-center text-sm ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}
                                >
                                  <span className={`w-4 h-4 flex items-center justify-center mr-2 border rounded ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                    {isActive && <span className="text-xs">✓</span>}
                                  </span>
                                  {option.label}
                                  <span className="ml-auto text-xs text-gray-500">({option.count})</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span 
                  key={filter}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {filter}
                  <button 
                    onClick={() => toggleFilter(filter)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredLocations.length}</span> {filteredLocations.length === 1 ? 'result' : 'results'}
          </p>
          <div className="flex items-center">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
            <select
              id="sort"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option>Recommended</option>
              <option>Distance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Image with Favorite Button */}
                <div className="relative h-48">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={location.image}
                    alt={location.name}
                  />
                  <button
                    className={`absolute top-3 right-3 p-2 rounded-full ${location.isFavorite ? 'bg-rose-100 text-rose-500' : 'bg-white/90 text-gray-400 hover:text-rose-500'}`}
                    onClick={() => {
                      // Toggle favorite status
                      const updatedLocations = locations.map(loc => 
                        loc.id === location.id 
                          ? { ...loc, isFavorite: !loc.isFavorite } 
                          : loc
                      );
                      // In a real app, you would update the state here
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill={location.isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      {location.spots} {location.spots === 1 ? 'spot' : 'spots'} left
                    </span>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {location.name}
                      </h3>
                      <p className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{location.address}</span>
                      </p>
                    </div>
                    <div className="flex items-center bg-indigo-50 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                      <Star className="h-3.5 w-3.5 mr-0.5 text-amber-400 fill-current" />
                      {location.rating}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {location.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-2xl font-bold text-gray-900">{location.rate}</p>
                      <p className="text-xs text-gray-500">{location.distance}</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5">
                      View Details
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
              <Search className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredLocations.length > 0 && (
          <div className="mt-10 text-center">
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Load more locations
              <ChevronDown className="ml-2 -mr-1 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
