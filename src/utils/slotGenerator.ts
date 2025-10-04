import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface SlotConfig {
  locationId: string;
  locationName: string;
  pricePerHour: number;
  numberOfSlots?: number;
}

/**
 * Generates slot numbers in format: A1, A2, B1, B2, C1, C2, etc.
 */
const generateSlotNumber = (index: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letterIndex = Math.floor(index / 10);
  const numberPart = (index % 10) + 1;
  const letter = letters[letterIndex % letters.length];
  return `${letter}${numberPart}`;
};

/**
 * Determines slot type based on index
 */
const getSlotType = (index: number): 'standard' | 'compact' | 'electric' | 'handicap' => {
  // Every 10th slot is electric
  if ((index + 1) % 10 === 0) return 'electric';
  // Every 5th slot (but not 10th) is handicap
  if ((index + 1) % 5 === 0) return 'handicap';
  // Every 3rd slot is compact
  if ((index + 1) % 3 === 0) return 'compact';
  // Rest are standard
  return 'standard';
};

/**
 * Generates and creates slots in Firestore for a location
 */
export const generateSlotsForLocation = async (config: SlotConfig): Promise<void> => {
  const { locationId, locationName, pricePerHour, numberOfSlots = 10 } = config;

  try {
    const slotsToCreate = [];

    for (let i = 0; i < numberOfSlots; i++) {
      const slotNumber = generateSlotNumber(i);
      const slotType = getSlotType(i);
      const floor = Math.floor(i / 10) + 1; // 10 slots per floor

      const slotData = {
        locationId,
        locationName,
        number: slotNumber,
        type: slotType,
        status: 'available',
        floor,
        pricePerHour,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      slotsToCreate.push(slotData);
    }

    // Create all slots in Firestore
    const promises = slotsToCreate.map(slotData => 
      addDoc(collection(db, 'slots'), slotData)
    );

    await Promise.all(promises);
    
    console.log(`Successfully created ${numberOfSlots} slots for location: ${locationName}`);
  } catch (error) {
    console.error('Error generating slots:', error);
    throw error;
  }
};

/**
 * Generates slot numbers for preview (without creating in DB)
 */
export const previewSlotNumbers = (count: number = 10): string[] => {
  return Array.from({ length: count }, (_, i) => generateSlotNumber(i));
};
