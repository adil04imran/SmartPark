# Automatic Slot Generation

## Overview
When an admin creates a new parking location, the system automatically generates parking slots based on the **"Total Slots"** number entered in the form. Each slot gets unique identifiers and properties.

## How It Works

### Slot Naming Convention
Slots are named using a letter-number combination:
- **A1, A2, A3...A10** (First 10 slots)
- **B1, B2, B3...B10** (Next 10 slots)
- **C1, C2, C3...C10** (And so on)

### Slot Types Distribution
The system automatically assigns different slot types:

| Slot Position | Type | Icon | Description |
|--------------|------|------|-------------|
| Every 10th slot | **Electric** | ⚡ | EV charging station |
| Every 5th slot (not 10th) | **Handicap** | ♿ | Accessible parking |
| Every 3rd slot | **Compact** | 🚗 | Smaller vehicles |
| All others | **Standard** | 🚗 | Regular parking |

### Example Distribution (First 10 slots):
- **A1**: Standard
- **A2**: Standard
- **A3**: Compact
- **A4**: Standard
- **A5**: Handicap
- **A6**: Compact
- **A7**: Standard
- **A8**: Standard
- **A9**: Compact
- **A10**: Electric

## Slot Properties

Each generated slot includes:

```typescript
{
  locationId: string;        // Reference to parent location
  locationName: string;      // Name of the parking location
  number: string;            // Slot identifier (e.g., "A1", "B5")
  type: string;              // 'standard' | 'compact' | 'electric' | 'handicap'
  status: string;            // 'available' | 'booked' | 'reserved' | 'maintenance'
  floor: number;             // Floor number (10 slots per floor)
  pricePerHour: number;      // Inherited from location
  createdAt: Timestamp;      // Creation timestamp
  updatedAt: Timestamp;      // Last update timestamp
}
```

## Admin Workflow

1. **Admin creates a new location** via the Admin Dashboard
2. **Admin enters the number of slots** in the "Total Slots" field (e.g., 10, 50, 100)
3. **System automatically generates that many slots** with the naming convention
4. **Slots are immediately available** for users to book
5. **Success notification** confirms location and slots creation

## User Experience

Users will see parking slots displayed as cards with:
- **Slot Number** (e.g., C3)
- **Floor Indicator** (e.g., F3)
- **Type Badge** (e.g., "Acce" for Accessible)
- **Price per Hour**
- **Availability Status** (color-coded)

### Status Colors:
- 🟢 **Green**: Available
- 🟡 **Yellow**: Reserved
- 🔴 **Red**: Booked/Maintenance

## Technical Implementation

### Files Modified:
1. **`src/utils/slotGenerator.ts`** - Slot generation logic
2. **`src/pages/Admin.tsx`** - Integration with location creation
3. **`firestore.rules`** - Security rules for slot creation

### No Cloud Functions Required
This implementation runs entirely **client-side** to avoid Firebase Cloud Functions charges.

## Dynamic Slot Generation

The number of slots generated is **automatically determined** by the "Total Slots" value entered in the Admin form:

- Enter **10** → Generates A1-A10
- Enter **25** → Generates A1-A10, B1-B10, C1-C5
- Enter **100** → Generates A1-A10, B1-B10... up to J1-J10

The system supports up to **1000 slots** per location.

## Security

Firestore rules ensure:
-  Only authenticated users can create slots
-  All users can read slot information
-  Only authorized users can update slot status
-  Authenticated users can delete slots

## Future Enhancements

Potential improvements:
- [ ] Custom slot naming patterns
- [ ] Bulk slot management
- [ ] Floor-based organization
- [ ] Dynamic slot type distribution
- [ ] Slot reservation system
- [ ] Maintenance scheduling
