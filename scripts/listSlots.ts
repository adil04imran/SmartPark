import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase/config';

async function listAllSlots() {
  try {
    console.log('Fetching all slots...');
    const slotsSnapshot = await getDocs(collection(db, 'slots'));
    
    if (slotsSnapshot.empty) {
      console.log('No slots found in the database.');
      return;
    }

    console.log(`\nFound ${slotsSnapshot.size} slots:\n`);
    
    slotsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Number: ${data.number}`);
      console.log(`Type: ${data.type}`);
      console.log(`Status: ${data.status}`);
      console.log(`Location ID: ${data.locationId}`);
      console.log(`Floor: ${data.floor}`);
      console.log(`Price: $${data.pricePerHour}/hr`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error listing slots:', error);
  } finally {
    process.exit(0);
  }
}

listAllSlots();
