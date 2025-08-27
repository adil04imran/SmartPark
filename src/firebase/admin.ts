import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
let adminAuth: any = null;
let adminDb: any = null;

try {
  // Path to the service account file
  const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('Firebase service account file not found');
  }
  
  // Read and parse the service account file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Initialize the Firebase Admin SDK
  const adminApp = getApps().length === 0 
    ? initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\\\n/g, '\\n')
        }),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      })
    : getApp();
  
  // Get Auth and Firestore instances
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
  process.exit(1);
}

export { adminAuth, adminDb };
