import { db } from '@/firebase/config';
import { doc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Check and release expired bookings
const checkAndReleaseExpiredBookings = async (userId?: string) => {
  try {
    const now = Timestamp.now();
    const bookingsRef = collection(db, 'bookings');
    
    // Build the query
    const queryConstraints = [
      where('status', '==', 'confirmed'),
      where('endTimestamp', '<=', now)
    ];
    
    // Add user filter if userId is provided
    if (userId) {
      queryConstraints.push(where('userId', '==', userId));
    }
    
    const q = query(bookingsRef, ...queryConstraints);
    
    // Add timeout to prevent hanging
    const queryPromise = getDocs(q);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 10000)
    );
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise]) as Awaited<typeof queryPromise>;
    
    // Process each expired booking
    const batchUpdates = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const booking = docSnapshot.data();
      
      // Add booking update
      batchUpdates.push(
        updateDoc(docSnapshot.ref, {
          status: 'completed',
          updatedAt: Timestamp.now()
        })
      );
      
      // Add slot update if slotId exists
      if (booking.slotId) {
        const slotRef = doc(db, 'slots', booking.slotId);
        batchUpdates.push(
          updateDoc(slotRef, {
            status: 'available',
            updatedAt: Timestamp.now()
          })
        );
      }
    }
    
    // Execute all updates in chunks to avoid rate limiting
    if (batchUpdates.length > 0) {
      const BATCH_SIZE = 10; // Process 10 updates at a time
      for (let i = 0; i < batchUpdates.length; i += BATCH_SIZE) {
        const batch = batchUpdates.slice(i, i + BATCH_SIZE);
        await Promise.all(batch);
        console.log(`Processed ${Math.min(i + BATCH_SIZE, batchUpdates.length)}/${batchUpdates.length} updates`);
      }
      console.log(`Released ${batchUpdates.length / 2} expired bookings`);
    } else {
      console.log('No expired bookings to release');
    }
    
    return true;
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      if (error?.message?.includes('index is currently building')) {
        console.warn('Firestore index is still building. This is normal and will resolve automatically.');
        // Return true to prevent error logging for this case
        return true;
      } else {
        console.error('Firestore index error. Please make sure all required indexes are created.');
        console.error('Error details:', error?.message);
      }
    } else if (error?.message === 'Query timeout') {
      console.warn('Query timed out. The operation took too long to complete.');
    } else {
      console.error('Error releasing expired bookings:', error);
    }
    return false;
  }
};

// Setup interval to check for expired bookings
export const setupBookingExpirationCheck = (userId?: string) => {
  let retryCount = 0;
  const MAX_RETRIES = 10;
  const INITIAL_DELAY = 30000; // 30 seconds
  
  const runCheck = async () => {
    try {
      const success = await checkAndReleaseExpiredBookings(userId);
      if (success) {
        retryCount = 0; // Reset retry count on success
      } else if (retryCount < MAX_RETRIES) {
        // Exponential backoff for retries
        const delay = Math.min(INITIAL_DELAY * Math.pow(2, retryCount), 300000); // Max 5 minutes
        console.log(`Retrying in ${delay/1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`);
        retryCount++;
        setTimeout(runCheck, delay);
        return;
      }
    } catch (error) {
      console.error('Error in booking check:', error);
    }
    
    // Schedule next check
    setTimeout(runCheck, 5 * 60 * 1000); // 5 minutes
  };
  
  // Initial run
  runCheck();
  
  // Return cleanup function
  return () => {
    // Any cleanup if needed
  };
};

// Helper function to create a booking with endTimestamp
export const createBookingWithEndTime = async (bookingData: any) => {
  try {
    const { date, endTime, ...rest } = bookingData;
    
    // Parse the date and time strings into a timestamp
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = endTime.split(':').map(Number);
    
    const endDate = new Date(year, month - 1, day, hours, minutes);
    
    // Create the booking with endTimestamp
    const bookingWithTimestamp = {
      ...rest,
      date,
      endTime,
      endTimestamp: Timestamp.fromDate(endDate),
      status: 'confirmed',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    return bookingWithTimestamp;
  } catch (error) {
    console.error('Error creating booking with end time:', error);
    throw error;
  }
};
