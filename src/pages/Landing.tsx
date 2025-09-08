import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import Navbar from '@/components/Navbar';
import { 
  Car,
  MapPin,
  Clock,
  Shield,
  Smartphone,
  Star,
  ArrowRight,
  CheckCircle,
  BatteryCharging,
  Navigation,
  Zap,
  ParkingSquare
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Real-Time Tracking",
      description: "See available parking spots in real-time with live updates."
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Save Time",
      description: "No more circling blocks. Find and reserve your spot instantly."
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Secure Parking",
      description: "24/7 monitored locations with top-notch security."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-600" />,
      title: "Easy to Use",
      description: "Simple and intuitive app for all your parking needs."
    }
  ];

  const benefits = [
    "Save up to 70% on parking costs",
    "No more circling around looking for spots",
    "Guaranteed parking at your destination",
    "24/7 customer support",
    "Contactless entry and exit"
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className={`relative pt-0 pb-8 md:pb-12 overflow-hidden bg-gradient-to-br from-blue-50 to-white transition-all duration-300`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Parking,
                <span className="block text-blue-600">Simplified</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Find and reserve parking spots in real-time. Save time, reduce stress, and park with confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-medium transition-colors"
                  onClick={() => navigate('/locations')}
                >
                  Find Parking
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-base font-medium"
                  onClick={() => navigate('/register')}
                >
                  Sign Up Free
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">{i}+</span>
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    <span className="font-medium">10,000+</span> happy users
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="relative w-full h-[400px] lg:h-[500px] xl:h-[600px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/modern-silver-electric-car-transparent-removebg-preview.png" 
                  alt="Modern Electric Car" 
                  className="h-full w-auto object-contain"
                  style={{
                    filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                    transform: 'translateY(5%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Smart Parking
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for a seamless parking experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                {/* Icon with animation */}
                <motion.div 
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors duration-300"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    className: 'w-6 h-6 group-hover:scale-110 transition-transform duration-300'
                  })}
                </motion.div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Animated border bottom on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-500 group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
          
          {/* Parking Spot Visualization */}
          <div className="mt-20 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-8 md:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Real-Time Parking Availability
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Check live parking spot availability at your destination
                </p>
                
                {/* Parking Lot Grid */}
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8">
                  {[...Array(8)].map((_, index) => {
                    const isOccupied = index % 3 === 0; // Simulate some occupied spots
                    return (
                      <div key={index} className="relative group">
                        <div 
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 p-2 ${
                            isOccupied 
                              ? 'bg-red-50 border border-red-100 text-red-600' 
                              : 'bg-green-50 border border-green-100 text-green-600 hover:shadow-md hover:-translate-y-1'
                          }`}
                        >
                          <Car 
                            className={`w-5 h-5 mb-1 ${isOccupied ? 'text-red-400' : 'text-green-500'}`} 
                          />
                          <span className="text-xs font-medium">A-{index + 1}</span>
                          <span className="text-[10px] opacity-70">
                            {isOccupied ? 'Taken' : 'Open'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Occupied</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/locations')}
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 text-base font-medium transition-colors"
                >
                  Find Available Parking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Parking Solution
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of hassle-free parking with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="slide-in-left">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                Why Choose Us
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Stress-Free Parking Experience
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join thousands of drivers who save time and reduce stress with real-time parking slot availability.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <span className="ml-3 text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  onClick={() => navigate('/register')}
                >
                  Start Parking Smarter
                </Button>
              </div>
            </div>
            {/* Added an illustrative image for benefits section */}
            <div className="hidden lg:flex justify-center items-center p-8">
              
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero-bg relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 fade-in-up">
            Ready to Transform Your Parking Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 fade-in-up-delay-1">
            Join thousands of drivers who have already discovered the smart way to park.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up-delay-2">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-white/90 px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
              onClick={() => navigate('/register')}
            >
              Sign Up Free
              <Star className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-blue-700 px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
              onClick={() => navigate('/locations')}
            >
              Find Parking
            </Button>
          </div>
        </div>
        
        {/* Background animation elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full float-animation-subtle"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full float-animation-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-white/5 rounded-full float-animation-subtle" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

    </div>
  );
};

export default Landing;