import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 Starting admin setup script...');

// Path to the service account file
const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');

// Verify service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account file not found at:', serviceAccountPath);
  console.log('Please make sure the service account file is in the root directory and named "firebase-service-account.json"');
  process.exit(1);
}

console.log('✅ Found Firebase service account file');

// Import Firebase Admin after verifying service account file
import { adminAuth, adminDb } from '../src/firebase/admin';

async function makeAdmin(email: string) {
  if (!adminAuth || !adminDb) {
    console.error('Firebase Admin not initialized. Check your service account configuration.');
    process.exit(1);
  }

  try {
    console.log(`Looking up user with email: ${email}`);
    
    // Get user by email
    const user = await adminAuth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);
    
    // Set custom claims
    console.log('Setting admin custom claims...');
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    // Update user role in Firestore
    console.log('Updating Firestore user document...');
    await adminDb.collection('users').doc(user.uid).set(
      { 
        role: 'admin',
        email: user.email,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    
    console.log(`✅ Successfully made ${email} an admin`);
    console.log('User ID:', user.uid);
  } catch (error) {
    const firebaseError = error as { message: string; errorInfo?: any };
    console.error('❌ Error making user admin:', firebaseError.message);
    if (firebaseError.errorInfo) {
      console.error('Error details:', firebaseError.errorInfo);
    }
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/setup-admin.ts user@example.com');
  process.exit(1);
}

// Run the admin setup
makeAdmin(email).catch(error => {
  console.error('❌ Error in admin setup:', error);
  process.exit(1);
});
