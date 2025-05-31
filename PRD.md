# Product Requirements Document (PRD)

## Project Title: CleanChain - Decentralized Garbage Collection Verification Platform

---

## 1. Overview

**Purpose:**  
To create a decentralized application (dApp) on the Monad blockchain using Hardhat, designed to track, verify, and incentivize neighborhood garbage collection via community participation. CleanChain enhances transparency and accountability using cryptographic proof (image hashes) and on-chain metadata with off-chain storage for efficiency.

**Target Users:**

- Households
- Garbage Collectors (Cleaners)
- Community Validators (other residents)
- Neighborhood Admins
- Platform Owner (super-admin)

**Technology Stack:**

- **Blockchain Layer:** Monad
- **Smart Contract Framework:** Hardhat (EVM-compatible)
- **Frontend:** React or Next.js
- **Off-chain Storage:** IPFS or Arweave
- **Authentication:** Web3 wallet (e.g., MetaMask)

---

## 2. Key Features

### 2.1 Household Interface

- Wallet connection and registration
- Register house with neighborhood and residents count
- Confirm garbage collection events (with image validation)
- Track household's garbage collection history
- Earn points and see leaderboard ranking

### 2.2 Cleaner Interface

- Register and log in using wallet
- Register as cleaner (cannot be both house and cleaner)
- Log house as "cleaned" with image proof
- Track cleaning history
- View reputation and points
- Be assigned to neighborhoods by admins

### 2.3 Validator Interface

- Upload reports of garbage spotted in public areas (complaints)
- Validate other users' reports (future: voting/validation)
- Earn points for validated reports

### 2.4 Admin/Owner Interface

- Register new neighborhoods and assign admins
- Assign/remove cleaners to/from neighborhoods (individually or batch)
- Activate/deactivate neighborhoods
- Update house points and cleaner reputation
- Pause/unpause contract (emergency)

### 2.5 Smart Contract Modules

- **Neighborhood Management**: Register, activate/deactivate, assign admins, assign cleaners
- **HouseRegistry**: Register houses, track points, residents, and collection history
- **CleanerRegistry**: Register cleaners, manage reputation, assigned neighborhoods, and collection history
- **CollectionLog**: Log and confirm garbage collection events with image proof and validation
- **ComplaintValidation**: Handle complaints and validator votes (future: expand validation logic)
- **Points & Reputation**: Award points for actions, update reputation for confirmed work
- **Statistics & Queries**: Get stats for houses, cleaners, neighborhoods, and events
- **Administrative Controls**: Pause/unpause, batch operations, update points/reputation

---

## 3. On-Chain Data Structures (Solidity / Hardhat)

```solidity
struct House {
    address wallet;
    uint256 points;
    string neighborhood;
    uint8 residents;
    bytes32[] collectionHashes;
    bool isRegistered;
    uint256 registrationTimestamp;
}

struct Cleaner {
    address wallet;
    uint256 points;
    uint256 reputation;
    bytes32[] collectionHashes;
    bool isRegistered;
    uint256 registrationTimestamp;
    string[] assignedNeighborhoods;
}

struct CollectionEvent {
    address cleaner;
    address house;
    uint256 timestamp;
    bytes32 imageHash;
    string imageURI;
    bool confirmedByHouse;
    uint256 eventId;
}

struct Complaint {
    address reporter;
    bytes32 imageHash;
    string imageURI;
    string location;
    string neighborhood;
    address[] validators;
    uint8 status; // 0 = PENDING, 1 = VALIDATED, 2 = INVALID
    uint256 timestamp;
    uint256 complaintId;
}

struct Neighborhood {
    string name;
    string description;
    address admin;
    bool isActive;
    uint256 registrationTimestamp;
    uint256 totalHouses;
    uint256 totalCleaners;
    uint256 totalCollections;
    uint256 confirmedCollections;
}
```

---

## 4. Major Contract Functions

- **Neighborhood Management**

  - `registerNeighborhood(name, description, admin)`
  - `assignNeighborhoodAdmin(neighborhood, newAdmin)`
  - `setNeighborhoodStatus(neighborhood, isActive)`
  - `assignCleanerToNeighborhood(cleaner, neighborhood)`
  - `removeCleanerFromNeighborhood(cleaner, neighborhood)`
  - `batchAssignCleanersToNeighborhood(cleaners[], neighborhood)`
  - `batchRemoveCleanersFromNeighborhood(cleaners[], neighborhood)`

- **House & Cleaner Registration**

  - `registerHouse(neighborhood, residents)`
  - `registerCleaner()`

- **Collection Events**

  - `logGarbageCollection(house, imageHash, imageURI)`
  - `confirmGarbageCollection(eventId, imageHash, imageURI)`
  - `getCollectionEvent(eventId)`
  - `getHouseCollectionEventsPaginated(house, offset, limit)`
  - `getCleanerCollectionEventsPaginated(cleaner, offset, limit)`
  - `getHouseCollectionStats(house)`
  - `getCleanerCollectionStats(cleaner)`

- **Complaints**

  - `complaints` mapping and struct (future: expand validation logic)

- **Queries & Stats**

  - `getNeighborhood(name)`
  - `getAllNeighborhoods()`
  - `getCleanerNeighborhoods(cleaner)`
  - `isCleanerAuthorized(cleaner, neighborhood)`
  - `isNeighborhoodAdmin(address)`
  - `getNeighborhoodStats(neighborhood)`
  - `getHouse(address)`
  - `getCleaner(address)`
  - `getHousesInNeighborhood(neighborhood)`
  - `getCleanersInNeighborhood(neighborhood)`
  - `getTotalHouses()`, `getTotalCleaners()`, `getTotalNeighborhoods()`
  - `isRegisteredHouse(address)`, `isRegisteredCleaner(address)`
  - `getAllRegisteredHouses()`, `getAllRegisteredCleaners()`
  - `isPaused()`
  - `validateNeighborhoodExists(name)`
  - `isCleanerAlreadyAssigned(cleaner, neighborhood)`

- **Administrative**
  - `updateHousePoints(house, points)`
  - `updateCleanerReputation(cleaner, reputation)`
  - `pauseContract(paused)`

---

## 5. Events

- `HouseRegistered`, `CleanerRegistered`, `CollectionEventCreated`, `CollectionEventConfirmed`, `ComplaintCreated`, `PointsAwarded`, `NeighborhoodRegistered`, `NeighborhoodAdminAssigned`, `CleanerAssignedToNeighborhood`, `CleanerRemovedFromNeighborhood`, `ContractPaused`, `NeighborhoodStatusChanged`

---

## 6. Notes

- All major actions are protected by appropriate modifiers (ownership, registration, admin, etc.)
- All registration and assignment actions emit events for off-chain indexing
- Points and reputation are awarded for registration, collection, and validation actions
- The contract is designed for extensibility (e.g., future expansion of complaint validation, more granular roles, etc.)
- All queries are view functions for efficient off-chain access
- Batch operations are available for admin efficiency
- Contract can be paused for emergency situations
