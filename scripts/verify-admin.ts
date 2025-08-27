import { adminAuth } from '../src/firebase/admin';

async function verifyAdmin(userId: string) {
  if (!adminAuth) {
    console.error('❌ Firebase Admin not initialized');
    process.exit(1);
  }

  try {
    console.log(`🔍 Verifying admin privileges for user: ${userId}`);
    
    // Get the user's custom claims
    const user = await adminAuth.getUser(userId);
    const isAdmin = user.customClaims?.admin === true;
    
    console.log('\n👤 User Details:');
    console.log(`- Email: ${user.email}`);
    console.log(`- Email Verified: ${user.emailVerified}`);
    console.log(`- Admin: ${isAdmin ? '✅ Yes' : '❌ No'}`);
    
    if (user.customClaims) {
      console.log('\n🔑 Custom Claims:');
      console.log(JSON.stringify(user.customClaims, null, 2));
    }
    
    return isAdmin;
  } catch (error) {
    console.error('❌ Error verifying admin status:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];
if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: npx tsx scripts/verify-admin.ts USER_ID');
  process.exit(1);
}

verifyAdmin(userId).then(isAdmin => {
  if (isAdmin) {
    console.log('\n✅ Verification successful! User has admin privileges.');
  } else {
    console.log('\n❌ User does not have admin privileges.');
  }
});
