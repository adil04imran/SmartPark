// Mock data for development with Hyderabad locations
export const mockLocations = [
  {
    id: 1,
    name: "Inorbit Mall Parking",
    address: "Mindspace IT Park, HITEC City, Hyderabad",
    distance: "3.2 km",
    totalSlots: 120,
    availableSlots: 45,
    pricePerHour: 30,
    coordinates: { lat: 17.4449, lng: 78.3805 },
    amenities: ["Security", "Covered", "Valet Parking"]
  },
  {
    id: 2,
    name: "GVK One Mall Parking",
    address: "Banjara Hills, Road No.1, Hyderabad",
    distance: "5.7 km",
    totalSlots: 200,
    availableSlots: 68,
    pricePerHour: 40,
    coordinates: { lat: 17.4254, lng: 78.4455 },
    amenities: ["Security", "24/7 Access", "EV Charging"]
  },
  {
    id: 3,
    name: "Rajiv Gandhi International Airport",
    address: "Shamshabad, Hyderabad",
    distance: "28.5 km",
    totalSlots: 500,
    availableSlots: 189,
    pricePerHour: 60,
    coordinates: { lat: 17.2403, lng: 78.4294 },
    amenities: ["Shuttle Service", "Security", "Covered"]
  },
  {
    id: 4,
    name: "Charminar Parking Plaza",
    address: "Near Charminar, Old City, Hyderabad",
    distance: "8.2 km",
    totalSlots: 150,
    availableSlots: 42,
    pricePerHour: 20,
    coordinates: { lat: 17.3616, lng: 78.4747 },
    amenities: ["Security", "24/7 Access", "Guarded"]
  },
  {
    id: 5,
    name: "Cyber Towers Parking",
    address: "HITEC City, Madhapur, Hyderabad",
    distance: "4.8 km",
    totalSlots: 300,
    availableSlots: 125,
    pricePerHour: 35,
    coordinates: { lat: 17.4454, lng: 78.3819 },
    amenities: ["Security", "Covered", "EV Charging", "Valet"]
  }
];

// Function to generate slots for a location
const generateSlots = (count, prefix = 'A') => {
  const slots = [];
  const statuses = ['available', 'booked'];
  const types = ['standard', 'handicap', 'electric', 'compact'];
  
  for (let i = 1; i <= count; i++) {
    const row = String.fromCharCode(64 + Math.ceil(i / 10)); // A, B, C, etc.
    const num = i % 10 || 10;
    const id = `${row}${num}`;
    
    // Make some slots booked randomly (about 20% chance)
    const status = Math.random() > 0.8 ? 'booked' : 'available';
    
    // Distribute slot types: 70% standard, 10% handicap, 10% electric, 10% compact
    let type = 'standard';
    const rand = Math.random();
    if (rand > 0.9) type = 'handicap';
    else if (rand > 0.8) type = 'electric';
    else if (rand > 0.7) type = 'compact';
    
    slots.push({ id, status, type });
  }
  return slots;
};

export const mockSlots = {
  1: generateSlots(120),  // Inorbit Mall Parking
  2: generateSlots(200),  // GVK One Mall Parking
  3: generateSlots(500),  // Rajiv Gandhi International Airport
  4: generateSlots(150),  // Charminar Parking Plaza
  5: generateSlots(300)   // Cyber Towers Parking
};

export const mockBookings = [
  {
    id: 'BK001',
    locationName: 'Inorbit Mall Parking',
    slotId: 'A1',
    date: '2024-08-20',
    startTime: '10:00',
    endTime: '18:00',
    duration: 8,
    totalCost: 240, // 8 hours * 30 INR/hour
    status: 'completed'
  },
  {
    id: 'BK002',
    locationName: 'GVK One Mall Parking',
    slotId: 'B3',
    date: '2024-08-22',
    startTime: '14:00',
    endTime: '17:00',
    duration: 3,
    totalCost: 120, // 3 hours * 40 INR/hour
    status: 'completed'
  },
  {
    id: 'BK003',
    locationName: 'Rajiv Gandhi International Airport',
    slotId: 'C5',
    date: '2024-08-25',
    startTime: '09:00',
    endTime: '21:00',
    duration: 12,
    totalCost: 720, // 12 hours * 60 INR/hour
    status: 'active'
  },
  {
    id: 'BK004',
    locationName: 'Charminar Parking Plaza',
    slotId: 'D2',
    date: '2024-08-27',
    startTime: '11:00',
    endTime: '15:00',
    duration: 4,
    totalCost: 80, // 4 hours * 20 INR/hour
    status: 'active'
  },
  {
    id: 'BK005',
    locationName: 'Cyber Towers Parking',
    slotId: 'E4',
    date: '2024-08-28',
    startTime: '09:00',
    endTime: '18:00',
    duration: 9,
    totalCost: 315, // 9 hours * 35 INR/hour
    status: 'upcoming'
  }
];

export const mockUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  joinDate: '2023-06-15',
  totalBookings: 15,
  favoriteLocations: [1, 3]
};