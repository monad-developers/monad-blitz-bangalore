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
- Mark garbage as collected (with image validation)
- Track household's garbage collection history
- Earn points and see leaderboard ranking

### 2.2 Cleaner Interface
- Register and log in using wallet
- Mark house as "cleaned" with image proof
- Track cleaning history
- View reputation and points

### 2.3 Validator Interface
- Upload reports of garbage spotted in public areas
- Validate other users' reports
- Earn points for validated reports

### 2.4 Smart Contract Modules
- `HouseRegistry` – mapping of household addresses and metadata
- `CleanerRegistry` – cleaner info, reputation, and proof logs
- `CollectionLog` – all proof logs with hash, timestamps, validator states
- `ComplaintValidation` – handling complaints and validator votes

---

## 3. On-Chain Data Structures (Solidity / Hardhat)

```solidity
struct House {
    address wallet;
    uint256 points;
    string neighborhood;
    uint8 residents;
    bytes32[] collectionHashes;
}

struct Cleaner {
    address wallet;
    uint256 points;
    uint256 reputation;
    bytes32[] collectionHashes;
}

struct CollectionEvent {
    address cleaner;
    address house;
    uint256 timestamp;
    bytes32 imageHash;
    string imageURI;
    bool confirmedByHouse;
}

struct Complaint {
    address reporter;
    bytes32 imageHash;
    string imageURI;
    string location;
    string neighborhood;
    address[] validators;
    uint8 status; // 0 = PENDING, 1 = VALIDATED, 2 = INVALID
}
