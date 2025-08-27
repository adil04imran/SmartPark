import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../src/firebase/config';

const LOCATION_ID = 's4vjtO4EO4JST4LUiozJ'; // Location ID from the URL

async function deleteAllSlots() {
  try {
    const slotsSnapshot = await getDocs(collection(db, 'slots'));
    const deletePromises = slotsSnapshot.docs.map((doc) => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    console.log(`Successfully deleted ${slotsSnapshot.size} slots`);
  } catch (error) {
    console.error('Error deleting slots:', error);
    throw error;
  }
}

async function createSampleSlots() {
  const slots = [
    { number: 'A1', type: 'standard', status: 'available', pricePerHour: 50, floor: 1, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'A2', type: 'handicap', status: 'available', pricePerHour: 45, floor: 1, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'A3', type: 'standard', status: 'available', pricePerHour: 63, floor: 1, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'B1', type: 'electric', status: 'available', pricePerHour: 65, floor: 2, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'B2', type: 'compact', status: 'available', pricePerHour: 55, floor: 2, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'B3', type: 'standard', status: 'available', pricePerHour: 45, floor: 2, isMovieThemed: false, locationId: LOCATION_ID },
    { number: 'C1', type: 'standard', status: 'available', pricePerHour: 60, floor: 3, isMovieThemed: true, locationId: LOCATION_ID },
    { number: 'C2', type: 'electric', status: 'available', pricePerHour: 70, floor: 3, isMovieThemed: true, locationId: LOCATION_ID },
    { number: 'C3', type: 'handicap', status: 'available', pricePerHour: 50, floor: 3, isMovieThemed: true, locationId: LOCATION_ID },
  ];

  try {
    const createPromises = slots.map(slot => 
      addDoc(collection(db, 'slots'), {
        ...slot,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );
    
    await Promise.all(createPromises);
    console.log(`Successfully created ${slots.length} slots`);
  } catch (error) {
    console.error('Error creating slots:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting slot reset...');
  
  console.log('Deleting existing slots...');
  await deleteAllSlots();
  
  console.log('Creating new slots...');
  await createSampleSlots();
  
  console.log('Slot reset completed successfully!');
  process.exit(0);
}

main().catch(console.error);
