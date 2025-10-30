import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin,
  Clock,
  Shield,
  Smartphone,
  CheckCircle,
  Car,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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

  // Scroll handling can be added back if needed
  useEffect(() => {
    // Scroll effect logic can be added here
  }, []);

  const header = (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 md:mb-6">
            Parking,
            <span className="block text-primary">Simplified</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
            Find and reserve parking spots in real-time. Save time, reduce stress, and park with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium"
              onClick={() => navigate('/locations')}
            >
              Find Parking
            </Button>
            {!currentUser && (
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium"
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
            )}
          </div>
          
          <div className="mt-6 md:mt-8 flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <span className="text-blue-600 text-xs sm:text-sm font-medium">{i}+</span>
                  </div>
                ))}
              </div>
              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium">10,000+</span> happy users
              </span>
            </div>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/modern-silver-electric-car-transparent-removebg-preview.png" 
              alt="Modern Electric Car" 
              className="h-full w-auto object-contain max-w-full"
              style={{
                filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1))',
                transform: 'translateY(5%)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout header={header} className="p-0">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <div className="relative z-10">
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <ScrollIndicator />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 lg:py-24 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
                Why Choose Smart Parking
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Everything you need for a seamless parking experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  
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
                  
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-blue-500 group-hover:w-full transition-all duration-500"></div>
                </motion.div>
              ))}
            </div>
            
            {/* Parking Spot Visualization */}
            <div className="mt-12 md:mt-20 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 sm:p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                    Real-Time Parking Availability
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                    Check live parking spot availability at your destination
                  </p>
                  
                  {/* Parking Lot Grid */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-md mx-auto mb-6 md:mb-8">
                    {[...Array(8)].map((_, index) => {
                      const isOccupied = index % 3 === 0;
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
                    className="mt-6 md:mt-8 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors"
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
        <section className="py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
                Why Choose Our Parking Solution
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Experience the future of hassle-free parking with our innovative platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
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
                
                <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    onClick={() => navigate('/register')}
                  >
                    Start Parking Smarter
                  </Button>
                </div>
              </div>
              
              {/* Empty space for illustration */}
              <div className="hidden lg:flex justify-center items-center p-8">
                {/* Illustration can be added here */}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Only show for non-logged in users */}
        {!currentUser && (
        <footer className="relative bg-white py-12 md:py-16 lg:py-20 px-4 sm:px-5 text-center font-sans overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 md:mb-4 text-gray-900 px-4">
              Ready to Transform Your Parking Experience?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of drivers who have already discovered the smart way to park.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 md:mb-12 px-4">
              <motion.a
                href="#signup"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Sign Up Free
              </motion.a>
              
              <motion.a
                href="#find-parking"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/locations');
                }}
              >
                Find Parking
              </motion.a>
            </div>
            
            <div className="text-sm text-gray-400">
              {new Date().getFullYear()} SmartParking. All rights reserved.
            </div>
          </div>
          
          {[
            { size: 'w-10 h-10', left: '10%', delay: 0 },
            { size: 'w-6 h-6', left: '30%', delay: 2 },
            { size: 'w-12 h-12', left: '60%', delay: 4 },
            { size: 'w-5 h-5', left: '80%', delay: 1 },
            { size: 'w-8 h-8', left: '50%', delay: 3 }
          ].map((bubble, index) => (
            <motion.div
              key={index}
              className={`absolute bottom-0 bg-blue-100/50 rounded-full ${bubble.size}`}
              style={{
                left: bubble.left,
                animation: 'rise 12s infinite ease-in',
                animationDelay: `${bubble.delay}s`,
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: -1200,
                scale: 1.3,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                delay: bubble.delay,
                ease: 'easeIn',
              }}
            />
          ))}
          
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes rise {
                0% {
                  transform: translateY(0) scale(1);
                  opacity: 0;
                }
                20% {
                  opacity: 1;
                }
                100% {
                  transform: translateY(-1200px) scale(1.3);
                  opacity: 0;
                }
              }
            `
          }} />
        </footer>
        )}
      </div>
    </PageLayout>
  );
};

export default Landing;