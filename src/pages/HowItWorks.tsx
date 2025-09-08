import { motion } from 'framer-motion';
import { Search, MapPin, Clock, CreditCard, CheckCircle } from 'lucide-react';

type Step = {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
};

export default function HowItWorks() {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Find Parking',
      description: 'Search for available parking spots near your destination using our interactive map or by entering an address.',
      icon: <Search className="h-8 w-8 text-blue-500" />
    },
    {
      id: 2,
      title: 'Select & Reserve',
      description: 'Choose your preferred parking spot and time slot, then reserve it with just a few taps.',
      icon: <MapPin className="h-8 w-8 text-blue-500" />
    },
    {
      id: 3,
      title: 'Park & Go',
      description: 'Drive to the location and park in your reserved spot. No need to worry about finding parking when you arrive!',
      icon: <Clock className="h-8 w-8 text-blue-500" />
    },
    {
      id: 4,
      title: 'Easy Payment',
      description: 'Pay securely through the app. Your payment is processed automatically when you end your parking session.',
      icon: <CreditCard className="h-8 w-8 text-blue-500" />
    }
  ];

  const benefits = [
    'Real-time parking availability',
    'Secure online payments',
    '24/7 customer support',
    'Flexible cancellation policy',
    'Competitive hourly rates',
    'Wide network of parking locations'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            How ParkWise Works
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Parking made simple, fast, and stress-free. Here's how you can start using ParkWise today.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple as 1-2-3
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Getting started with ParkWise is quick and easy. Follow these simple steps:
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    {step.icon}
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose ParkWise?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Experience the future of parking with these amazing benefits
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-lg font-medium text-gray-900">{benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of happy parkers who save time and money with ParkWise.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Find Parking Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
