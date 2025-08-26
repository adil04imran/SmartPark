# SmartPark - Smart Parking Management System

SmartPark is a modern web application for managing parking spaces in Hyderabad. It provides real-time parking availability, booking management, and an intuitive user interface for both customers and administrators.

## Features

- **User Authentication**: Sign up, login, and profile management
- **Real-time Parking Availability**: View available parking slots in real-time
- **Booking System**: Reserve parking slots with ease
- **Admin Dashboard**: Manage locations, bookings, and users
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **Routing**: React Router
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for production deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adil04imran/SmartPark.git
   cd SmartPark
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password, Google Sign-In)
   - Set up a Firestore database
   - Create a `.env` file in the root directory with your Firebase config:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Firebase:
   ```bash
   firebase login
   firebase init
   firebase deploy
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React contexts
├── data/          # Mock data and constants
├── firebase/      # Firebase configuration and services
├── hooks/         # Custom React hooks
├── pages/         # Application pages
├── styles/        # Global styles
└── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
