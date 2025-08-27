const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled function that runs every minute to check for expired bookings
 * and release the associated slots
 */
exports.releaseExpiredSlots = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    try {
      // Query for all active bookings where endTime has passed
      const expiredBookings = await db
        .collection('bookings')
        .where('status', '==', 'confirmed')
        .where('endTimestamp', '<=', now)
        .get();

      const batch = db.batch();
      let releasedCount = 0;

      // Process each expired booking
      for (const doc of expiredBookings.docs) {
        const booking = doc.data();
        
        // Update the booking status to 'completed'
        batch.update(doc.ref, { 
          status: 'completed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp() 
        });
        
        // Update the slot status to 'available'
        if (booking.slotId) {
          const slotRef = db.collection('slots').doc(booking.slotId);
          batch.update(slotRef, { 
            status: 'available',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          releasedCount++;
        }
      }

      // Commit all updates in a single batch
      await batch.commit();
      
      console.log(`Released ${releasedCount} expired slots`);
      return null;
      
    } catch (error) {
      console.error('Error releasing expired slots:', error);
      return null;
    }
  });

/**
 * Triggered when a new booking is created to set the endTimestamp
 */
exports.processNewBooking = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const booking = snapshot.data();
    
    // Skip if endTimestamp is already set
    if (booking.endTimestamp) {
      return null;
    }
    
    try {
      // Parse the date and time strings into a timestamp
      const [year, month, day] = booking.date.split('-').map(Number);
      const [hours, minutes] = booking.endTime.split(':').map(Number);
      
      const endDate = new Date(year, month - 1, day, hours, minutes);
      
      // Update the booking with the endTimestamp
      await snapshot.ref.update({
        endTimestamp: admin.firestore.Timestamp.fromDate(endDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update the slot status to 'booked'
      if (booking.slotId) {
        await db.collection('slots').doc(booking.slotId).update({
          status: 'booked',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      return null;
      
    } catch (error) {
      console.error('Error processing new booking:', error);
      return null;
    }
  });
