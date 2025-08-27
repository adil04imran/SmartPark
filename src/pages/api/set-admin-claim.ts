import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'UID is required' });
  }

  try {
    // Set custom user claims on this user.
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    
    // Update the user's role in Firestore
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({ role: 'admin' }, { merge: true });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
