require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Verify required environment variables
const requiredVars = ['FIREBASE_ADMIN_KEY'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

console.log('Environment variables loaded successfully');

// Import after loading environment variables
const { adminAuth, adminDb } = require('../src/firebase/admin');

async function testAdmin() {
  if (!adminAuth || !adminDb) {
    console.error('❌ Firebase Admin not initialized');
    process.exit(1);
  }

  try {
    console.log('✅ Firebase Admin initialized successfully');
    console.log('Testing Firestore connection...');
    
    // Test Firestore connection
    const testDoc = await adminDb.collection('test').doc('connection-test').get();
    console.log('✅ Firestore connection successful');
    
    // List first 5 users
    console.log('\nListing first 5 users:');
    const users = await adminAuth.listUsers(5);
    users.users.forEach((userRecord) => {
      console.log(`- ${userRecord.email} (${userRecord.uid})`);
    });
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.errorInfo) {
      console.error('Error details:', error.errorInfo);
    }
    process.exit(1);
  }
}

testAdmin();
