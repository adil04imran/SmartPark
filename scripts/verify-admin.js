import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verify required environment variables
const requiredVars = ['FIREBASE_ADMIN_KEY'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

console.log('✅ Environment variables loaded successfully');

// Parse service account
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
} catch (error) {
  console.error('❌ Failed to parse FIREBASE_ADMIN_KEY:', error.message);
  process.exit(1);
}

// Initialize the app with a service account, granting admin privileges
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
      }),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  }
  
  console.log('✅ Firebase Admin initialized successfully');
  
  // Test Firestore
  const db = admin.firestore();
  console.log('✅ Firestore initialized');
  
  // Test Auth
  const auth = admin.auth();
  console.log('✅ Auth initialized');
  
  // List users (first 5)
  console.log('\nListing first 5 users:');
  const listUsersResult = await auth.listUsers(5);
  listUsersResult.users.forEach((userRecord) => {
    console.log(`- ${userRecord.email || 'No email'} (${userRecord.uid})`);
  });
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}
