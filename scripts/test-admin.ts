import 'dotenv/config';
import { adminAuth, adminDb } from '../src/firebase/admin';

// Verify required environment variables
const requiredVars = ['FIREBASE_ADMIN_KEY'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

console.log('Environment variables loaded successfully');

async function testAdmin() {
  if (!adminAuth || !adminDb) {
    console.error('❌ Firebase Admin not initialized');
    process.exit(1);
  }

  try {
    console.log('✅ Firebase Admin initialized successfully');
    console.log('Testing Firestore connection...');
    
    // Test Firestore connection
    await adminDb.collection('test').doc('connection-test').get();
    console.log('✅ Firestore connection successful');
    
    // List first 5 users
    console.log('\nListing first 5 users:');
    const users = await adminAuth.listUsers(5);
    users.users.forEach((userRecord) => {
      console.log(`- ${userRecord.email} (${userRecord.uid})`);
    });
    
  } catch (error) {
    const firebaseError = error as { message: string; errorInfo?: any };
    console.error('❌ Test failed:', firebaseError.message);
    if (firebaseError.errorInfo) {
      console.error('Error details:', firebaseError.errorInfo);
    }
    process.exit(1);
  }
}

testAdmin();
