# 🌟 Monad NFT Marketplace

**A revolutionary NFT marketplace built on Monad Testnet featuring innovative Price Reactive NFTs, rental system, and community-driven pricing mechanisms.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Monad](https://img.shields.io/badge/blockchain-Monad%20Testnet-purple.svg)](https://docs.monad.xyz/)
[![React](https://img.shields.io/badge/frontend-React%2019-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/backend-Node.js-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/contracts-Solidity%200.8.19-red.svg)](https://soliditylang.org/)

## 🎯 Project Overview

The Monad NFT Marketplace is a cutting-edge platform that brings innovative features to the NFT ecosystem:

- **🚀 Price Reactive (PR) NFTs**: Community voting directly influences NFT prices
- **🏠 NFT Rental System**: Rent NFTs for temporary usage rights
- **🔒 Secure Trading**: Transparent blockchain-based transactions
- **📱 Modern UI/UX**: Responsive design with real-time updates
- **⚡ High Performance**: Built on Monad's optimized blockchain infrastructure

## 🌟 Key Features

### 💎 Price Reactive NFTs
- **Community Voting**: Users can like/dislike PR NFTs to influence final price
- **Dynamic Pricing**: Final price = `basePrice + (likes - dislikes) × 0.0001 MON`
- **Automated Finalization**: Backend jobs automatically finalize expired PR periods
- **Time-limited Voting**: Fixed voting periods create urgency and engagement

### 🏪 Traditional NFT Trading
- **Instant Minting**: Upload to IPFS and mint in one transaction
- **Buy/Sell Marketplace**: Standard NFT trading functionality
- **Real-time Updates**: Live price and status updates
- **Owner Management**: List, delist, and manage your NFTs

### 🏠 NFT Rental System
- **Temporary Rights**: Rent NFTs for specified durations
- **Flexible Pricing**: Owners set daily rental rates
- **Automatic Expiry**: Smart contract handles rental periods
- **Usage Rights**: Renters get temporary user privileges

### 🔧 Advanced Features
- **IPFS Integration**: Decentralized metadata and image storage
- **Search & Filter**: Advanced discovery with multiple criteria
- **Real-time Notifications**: Toast messages for all actions
- **Wallet Integration**: Seamless Web3 wallet connectivity
- **Mobile Responsive**: Works perfectly on all devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Smart Contract  │
│                 │    │                 │    │                 │
│  React + Vite   │◄──►│ Node.js/Express │◄──►│   Solidity      │
│  TailwindCSS    │    │   MongoDB       │    │   Monad Chain   │
│  Ethers.js      │    │   IPFS/Pinata   │    │   OpenZeppelin  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
Monad-NFT-Marketplace/
├── 📂 smartContract/         # Blockchain contracts
│   ├── contracts/
│   │   └── NFTMarketplace.sol
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.js
├── 📂 frontend/              # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Helper functions
│   └── package.json
├── 📂 Backend/               # API server
│   ├── controllers/         # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── jobs/               # Background jobs
│   └── index.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Pinata IPFS account
- MetaMask or compatible Web3 wallet
- Monad Testnet MON tokens

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Blitz_Bangalore_monad
```

### 2. Smart Contract Setup
```bash
cd smartContract
npm install
cp .env.example .env
# Configure .env with your Monad testnet details
npx hardhat run scripts/deploy.js --network monad
```

### 3. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Configure MongoDB and Pinata credentials
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Smart Contract: Deployed on Monad Testnet

## 🔧 Configuration

### Environment Variables

#### Smart Contract (.env)
```env
PRIVATE_KEY=your_wallet_private_key
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
```

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nft-marketplace

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Blockchain
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
NFT_CONTRACT_ADDRESS=0x6919B2303c62e822Ad9191B2D70F8D5e9fd10B55

# Server
PORT=5000
AUTO_BUY_ENABLED=true
```

#### Frontend (Constants)
```javascript
// src/utils/constants.js
export const CONTRACT_ADDRESS = "0x6919B2303c62e822Ad9191B2D70F8D5e9fd10B55";
export const API_BASE_URL = "http://localhost:5000";
```

## 🎮 Usage Guide

### For Users

#### 1. Connect Wallet
- Click "Connect Wallet" 
- Approve MetaMask connection
- Ensure you're on Monad Testnet

#### 2. Mint an NFT
- Navigate to "Mint NFT" page
- Upload image and fill metadata
- Choose between regular NFT or Price Reactive NFT
- Confirm transaction in wallet

#### 3. Buy NFTs
- Browse marketplace
- Click "Buy Now" on any listed NFT
- Confirm purchase transaction

#### 4. Rent NFTs
- Find NFTs listed for rent
- Select rental duration
- Pay rental fee
- Enjoy temporary usage rights

#### 5. Vote on PR NFTs
- Find Price Reactive NFTs
- Click Like/Dislike to influence price
- Watch real-time price changes
- Purchase when PR period ends

### For Developers

#### Smart Contract Interaction
```javascript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ABI } from './constants';

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Mint NFT
await contract.mintNFT(address, tokenURI, basePrice);

// Buy NFT
await contract.buyNFT(tokenId, { value: price });

// List for rent
await contract.listForRent(tokenId, dailyRate);
```

#### API Usage
```javascript
// Fetch all NFTs
const response = await fetch('/api/nfts?page=1&limit=10');
const { nfts } = await response.json();

// Upload to IPFS
const formData = new FormData();
formData.append('image', file);
const { ipfsHash } = await fetch('/api/nfts/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json());
```

## 🔐 Smart Contract Features

### Core Functions
- `mintNFT()` - Create new NFTs with metadata
- `buyNFT()` - Purchase listed NFTs
- `listForSale()` / `delistFromSale()` - Manage sale listings
- `listForRent()` / `rentNFT()` - Handle rental system
- `lockNFT()` - Temporary lock mechanism

### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Secure ownership management
- **Access Control**: Function-level permissions
- **Input Validation**: Comprehensive parameter checking

### Events
```solidity
event NFTMinted(uint256 indexed tokenId, address indexed owner, uint256 basePrice, string tokenURI);
event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
event NFTRented(uint256 indexed tokenId, address indexed renter, address indexed owner, uint256 duration, uint256 totalCost);
```

## 🛠️ API Documentation

### NFT Endpoints
- `GET /api/nfts` - List all NFTs with filtering
- `GET /api/nfts/:tokenId` - Get specific NFT details
- `POST /api/nfts/upload` - Upload image to IPFS
- `POST /api/nfts/mint` - Store minted NFT data
- `GET /api/nfts/stats` - Get marketplace statistics

### PR NFT Endpoints
- `POST /api/nfts/like` - Like a PR NFT
- `POST /api/nfts/dislike` - Dislike a PR NFT
- `GET /api/nfts/finalized` - Get finalized PR NFTs

### Management Endpoints
- `POST /api/nfts/list-sale` - List NFT for sale
- `POST /api/nfts/delist-sale` - Remove from sale
- `POST /api/nfts/mark-purchased` - Mark as purchased

## 🤖 Background Jobs

### PR NFT Finalization
- **Frequency**: Every minute
- **Function**: Automatically finalize expired PR NFTs
- **Process**: Calculate final price and mark as ready for purchase

### Rental Management  
- **Frequency**: Every hour
- **Function**: Check and expire completed rentals
- **Process**: Update rental status and restore owner rights

## 📊 Database Schema

### NFT Model
```javascript
{
  tokenId: Number,              // Unique identifier
  owner: String,                // Owner wallet address
  name: String,                 // NFT name
  description: String,          // NFT description
  imageURL: String,             // IPFS image URL
  metadataURI: String,          // IPFS metadata URL
  basePrice: Number,            // Base price in MON
  isForSale: Boolean,           // Sale listing status
  isForRent: Boolean,           // Rental listing status
  isPR: Boolean,                // Price Reactive flag
  prEndTime: Date,              // PR voting end time
  likes: Number,                // PR likes count
  dislikes: Number,             // PR dislikes count
  mintedAt: Date,               // Creation timestamp
  // ... more fields
}
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd smartContract
npx hardhat test
npx hardhat coverage
```

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🌐 Deployment

### Smart Contract Deployment
```bash
npx hardhat run scripts/deploy.js --network monad
npx hardhat verify --network monad <contract-address>
```

### Backend Deployment
- Deploy to Heroku, Railway, or AWS
- Configure production environment variables
- Set up MongoDB Atlas production cluster

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Configure production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monad Team** - For the innovative blockchain infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **Pinata** - For reliable IPFS pinning services
- **React Team** - For the powerful frontend framework

## 📞 Support

- **Documentation**: Check component READMEs for detailed setup
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord for discussions

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Contract Explorer**: [Monad Explorer](https://explorer.monad.xyz/)
- **Documentation**: [Monad Docs](https://docs.monad.xyz/)
- **IPFS Gateway**: [Pinata Gateway](https://gateway.pinata.cloud/)

---

**Built with ❤️ for the Monad Blitz Bangalore Hackathon**
