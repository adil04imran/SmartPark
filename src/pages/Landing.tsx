import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Shield, 
  Smartphone, 
  Star, 
  ArrowRight,
  Car,
  Zap,
  CheckCircle
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: "Find Nearby Parking",
      description: "Locate available parking spots near your destination with real-time updates."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Book in Advance",
      description: "Reserve your parking spot ahead of time and save money with early bird rates."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Safe",
      description: "All parking locations are verified and monitored for your vehicle's safety."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Mobile Friendly",
      description: "Manage your bookings on-the-go with our responsive mobile interface."
    }
  ];

  const benefits = [
    "Save up to 70% on parking costs",
    "No more circling around looking for spots",
    "Guaranteed parking at your destination",
    "24/7 customer support",
    "Contactless entry and exit"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 fade-in-up">
              Smart Parking Made
              <span className="block text-primary-light fade-in-up-delay-1">Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto fade-in-up-delay-2">
              Find, book, and pay for parking spots instantly. Save time, money, and stress with SmartPark.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up-delay-3">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => navigate('/locations')}
              >
                Find Parking Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-30 float-animation">
          <Car className="h-12 w-12 text-white" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-30 pulse-glow">
          <Zap className="h-10 w-10 text-white" />
        </div>
        <div className="absolute top-32 right-20 opacity-20 float-animation" style={{ animationDelay: '1s' }}>
          <MapPin className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-32 left-20 opacity-20 bounce-slow" style={{ animationDelay: '0.5s' }}>
          <Shield className="h-10 w-10 text-white" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose SmartPark?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make parking hassle-free with cutting-edge technology and user-friendly design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-hover text-center fade-in-up group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Park Smarter, Not Harder
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of satisfied customers who have made the switch to smart parking. 
                Experience the convenience of guaranteed parking spots at unbeatable prices.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 fade-in-up group"
                    style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                  >
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="btn-gradient mt-8 fade-in-up"
                style={{ animationDelay: '0.8s' }}
                onClick={() => navigate('/register')}
              >
                Get Started Today
              </Button>
            </div>
            
            <div className="relative animate-slide-in-right">
              <Card className="p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary mb-2 pulse-glow">Your Next Booking</h3>
                    <p className="text-muted-foreground">Downtown Mall Parking</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/10 hover:scale-105">
                      <span>Location</span>
                      <span className="font-semibold">123 Main St</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/10 hover:scale-105">
                      <span>Duration</span>
                      <span className="font-semibold">8 hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg transition-all duration-300 hover:bg-primary/10 hover:scale-105">
                      <span>Cost</span>
                      <span className="font-semibold text-success">$24.00</span>
                    </div>
                  </div>
                  
                  <Button className="w-full btn-gradient transition-all duration-300 hover:scale-105" size="lg">
                    Book This Spot
                  </Button>
                </div>
              </Card>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full float-animation"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-success/20 rounded-full float-animation" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
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
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
              onClick={() => navigate('/register')}
            >
              Sign Up Free
              <Star className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
              onClick={() => navigate('/locations')}
            >
              Find Parking
            </Button>
          </div>
        </div>
        
        {/* Background animation elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full float-animation"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full float-animation" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-white/5 rounded-full float-animation" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>
    </div>
  );
};

export default Landing;