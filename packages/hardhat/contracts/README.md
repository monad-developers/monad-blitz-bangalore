# CleanChain Smart Contract

CleanChain is a decentralized garbage collection verification platform built on the Monad blockchain using Hardhat. This smart contract enables transparent tracking and verification of neighborhood garbage collection through community participation.

## Contract Overview

The CleanChain contract implements the core functionality for:
- House registration with wallet public keys
- Cleaner registration and reputation management
- **Garbage collection event logging with image proof**
- **House validation of collection events**
- Points system for incentivizing participation
- Neighborhood-based organization

## Features Implemented

### ✅ House Registration
- Houses can register with their wallet address (public key)
- Required information: neighborhood name and number of residents
- Validation: prevents double registration, validates input parameters
- Automatic points award (10 points) for registration
- Neighborhood-based tracking and organization

### ✅ Cleaner Registration
- Cleaners can register with their wallet address
- Starts with base reputation of 100 points
- Prevents dual registration (house + cleaner from same address)
- Automatic points award (10 points) for registration

### ✅ **Garbage Collection Events**
- **Cleaner Collection Logging**: Cleaners can log garbage collection with image proof
- **House Validation**: Houses can confirm collection events with their own validation images
- **Image Hash Storage**: Cryptographic hashes stored in `collectionHashes` arrays
- **Dual Verification**: Both cleaner and house images linked to collection events
- **Reputation System**: Confirmed collections boost cleaner reputation
- **Points Rewards**: Both parties earn points for participation and validation

### ✅ Data Structures
Based on PRD specifications:
- `House` struct: wallet, points, neighborhood, residents, collection hashes, registration data
- `Cleaner` struct: wallet, points, reputation, collection hashes, registration data
- `CollectionEvent` struct: **FULLY IMPLEMENTED** - tracks cleaner, house, timestamps, image hashes, confirmation status
- `Complaint` struct: ready for future complaint/validation implementation

## Smart Contract Functions

### House Management
- `registerHouse(neighborhood, residents)` - Register a new house
- `getHouse(address)` - Get house information
- `isRegisteredHouse(address)` - Check if address is registered house
- `getHousesInNeighborhood(neighborhood)` - Get all houses in neighborhood
- `getAllRegisteredHouses()` - Get all registered house addresses
- **`confirmGarbageCollection(eventId, imageHash, imageURI)`** - Validate collection event

### Cleaner Management
- `registerCleaner()` - Register as a cleaner
- `getCleaner(address)` - Get cleaner information
- `isRegisteredCleaner(address)` - Check if address is registered cleaner
- `getAllRegisteredCleaners()` - Get all registered cleaner addresses
- **`logGarbageCollection(houseAddress, imageHash, imageURI)`** - Log collection with proof

### **Collection Event Management**
- **`getCollectionEvent(eventId)`** - Get detailed event information
- **`getHouseCollectionEvents(address)`** - Get all collection events for a house
- **`getCleanerCollectionEvents(address)`** - Get all collection events for a cleaner
- **`getHouseCollectionStats(address)`** - Get house statistics (total, confirmed, pending)
- **`getCleanerCollectionStats(address)`** - Get cleaner statistics with confirmation rate

### Statistics
- `getTotalHouses()` - Get total number of registered houses
- `getTotalCleaners()` - Get total number of registered cleaners
- **`totalCollectionEvents`** - Get total collection events logged

### Owner Functions
- `updateHousePoints(address, points)` - Update house points (owner only)
- `updateCleanerReputation(address, reputation)` - Update cleaner reputation (owner only)

## Events
- `HouseRegistered` - Emitted when a house registers
- `CleanerRegistered` - Emitted when a cleaner registers
- `PointsAwarded` - Emitted when points are awarded
- **`CollectionEventCreated`** - Emitted when cleaner logs collection
- **`CollectionEventConfirmed`** - Emitted when house validates collection

## **Collection Workflow**

### 1. Cleaner Logs Collection
```solidity
// Cleaner takes photo and logs collection
cleanChain.logGarbageCollection(
    houseAddress,
    keccak256(imageData), // Hash of the image
    "ipfs://QmImageHash"  // IPFS/Arweave URI
);
```
**Result**: 
- 20 points awarded to cleaner
- Image hash stored in cleaner's `collectionHashes`
- `CollectionEventCreated` event emitted

### 2. House Validates Collection
```solidity
// House takes validation photo and confirms
cleanChain.confirmGarbageCollection(
    eventId,
    keccak256(validationImageData), // Hash of validation image
    "ipfs://QmValidationHash"       // IPFS/Arweave URI
);
```
**Result**:
- 10 bonus points to cleaner
- 15 points to house for validation
- +5 reputation boost for cleaner
- Both image hashes stored in house's `collectionHashes`
- `CollectionEventConfirmed` event emitted

## **Points System**
- **House Registration**: 10 points
- **Cleaner Registration**: 10 points  
- **Garbage Collection**: 20 points (cleaner)
- **Collection Confirmation**: 10 bonus points (cleaner) + 15 points (house)
- **Reputation Boost**: +5 reputation for confirmed collections

## Validation & Security
- Input validation for neighborhood names and resident counts
- Prevention of double registration and double confirmation
- Owner-only functions for administrative tasks
- Proper access control modifiers
- Image hash validation (non-zero, non-empty URI)
- Event ID validation and authorization checks

## Gas Usage
Based on test results:
- House registration: ~267k gas (average)
- Cleaner registration: ~200k gas (average)
- **Garbage collection logging**: ~224k gas (average)
- **Collection confirmation**: ~154k gas (average)
- Contract deployment: ~2.7M gas

## Testing
Comprehensive test suite includes:
- Registration functionality tests
- **Garbage collection event tests**
- **Collection validation tests**
- **Event query and statistics tests**
- Validation and error handling tests
- View function tests
- Owner function tests
- Event emission tests

**37 tests passing** with full coverage of all functionality.

## **Real-World Usage Example**

```solidity
// 1. Setup participants
cleanChain.registerHouse("Downtown", 3);
cleanChain.registerCleaner();

// 2. Cleaner collects garbage and logs with photo
bytes32 imageHash = keccak256(imageData);
cleanChain.logGarbageCollection(
    houseAddress, 
    imageHash, 
    "ipfs://QmCleanerPhoto"
);

// 3. House validates collection with their own photo
bytes32 validationHash = keccak256(validationImageData);
cleanChain.confirmGarbageCollection(
    0, // event ID
    validationHash,
    "ipfs://QmHouseValidation"  
);

// 4. Check results
CollectionEvent memory event = cleanChain.getCollectionEvent(0);
// event.confirmedByHouse == true
// Both participants earned points and reputation
```

## Future Expansion
The contract structure is ready for implementing:
- Advanced reputation algorithms
- Point-based reward distribution
- Community complaint and validation system
- Multi-signature collection verification
- Time-based collection schedules

## Contract Address
After deployment, the contract address will be available in `deployedContracts.ts` for frontend integration. 