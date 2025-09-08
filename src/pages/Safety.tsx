import { Shield, Lock, AlertCircle, Clock, Phone, MapPin } from 'lucide-react';

type SafetyTip = {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
};

type EmergencyContact = {
  id: number;
  name: string;
  number: string;
  description: string;
  icon: JSX.Element;
};

export default function Safety() {
  const safetyTips: SafetyTip[] = [
    {
      id: 1,
      title: 'Verify Parking Spots',
      description: 'Always verify the parking spot matches the one in your booking confirmation before leaving your vehicle.',
      icon: <MapPin className="h-6 w-6 text-blue-500" />
    },
    {
      id: 2,
      title: 'Secure Your Vehicle',
      description: 'Always lock your vehicle and ensure all windows are closed. Never leave valuables in plain sight.',
      icon: <Lock className="h-6 w-6 text-blue-500" />
    },
    {
      id: 3,
      title: 'Be Aware of Surroundings',
      description: 'Stay alert when walking to and from your vehicle, especially at night. Park in well-lit areas when possible.',
      icon: <AlertCircle className="h-6 w-6 text-blue-500" />
    },
    {
      id: 4,
      title: 'Check Operating Hours',
      description: 'Be aware of the parking facility\'s operating hours to avoid being locked in or towing.',
      icon: <Clock className="h-6 w-6 text-blue-500" />
    },
    {
      id: 5,
      title: 'Report Suspicious Activity',
      description: 'If you notice anything suspicious, report it to the parking facility management or local authorities immediately.',
      icon: <Shield className="h-6 w-6 text-blue-500" />
    },
    {
      id: 6,
      title: 'Emergency Contacts',
      description: 'Save important contact numbers including local authorities and the parking facility\'s security.',
      icon: <Phone className="h-6 w-6 text-blue-500" />
    }
  ];

  const emergencyContacts: EmergencyContact[] = [
    {
      id: 1,
      name: 'Local Police',
      number: '911',
      description: 'For emergencies requiring immediate police assistance',
      icon: <Shield className="h-5 w-5 text-red-500" />
    },
    {
      id: 2,
      name: 'ParkWise Support',
      number: '1-800-PARKWISE',
      description: '24/7 customer support for any parking-related issues',
      icon: <Phone className="h-5 w-5 text-blue-500" />
    },
    {
      id: 3,
      name: 'Roadside Assistance',
      number: '1-800-ROADSIDE',
      description: 'For vehicle breakdowns or lockout services',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 bg-opacity-20 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your Safety is Our Priority
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            At ParkWise, we take safety seriously. Here's how we protect you and your vehicle.
          </p>
        </div>
      </div>

      {/* Safety Tips Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Safety Tips & Guidelines
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Follow these tips to ensure a safe and secure parking experience
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {safetyTips.map((tip) => (
                <div key={tip.id} className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          {tip.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {tip.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Emergency Contacts
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Save these important numbers for emergencies
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {contact.icon}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-lg font-medium text-gray-900 truncate">
                            {contact.name}
                          </dt>
                          <dd className="mt-1 text-2xl font-semibold text-gray-900">
                            {contact.number}
                          </dd>
                          <dd className="mt-1 text-sm text-gray-500">
                            {contact.description}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a 
                        href={`tel:${contact.number.replace(/-/g, '')}`}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Call now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Commitment */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-2xl px-6 py-12 sm:p-10 lg:flex lg:items-center">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Our Safety Commitment
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-600">
                We partner with parking facilities that meet our strict safety and security standards. 
                Every location is vetted to ensure proper lighting, surveillance, and security measures 
                are in place to protect you and your vehicle.
              </p>
              <div className="mt-6">
                <div className="inline-flex rounded-md shadow">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                  >
                    Report a Safety Concern
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
