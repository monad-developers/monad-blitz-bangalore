# NFT Marketplace Backend

A Node.js + Express backend for the NFT marketplace that handles **database operations and IPFS uploads only**. All blockchain transactions are handled by the frontend.

## 🔥 Features

- **MongoDB Database Operations** - Store and manage NFT metadata
- **IPFS Integration** - Upload images and metadata via Pinata
- **PR NFT Auto-finalization** - Background job to finalize expired PR NFT prices
- **RESTful API** - Complete CRUD operations for NFTs
- **Like/Dislike System** - For PR (Price-Reactive) NFTs
- **Rental System** - List and manage NFT rentals
- **Advanced Filtering** - Search, sort, and paginate NFTs

## 🚀 Tech Stack

- **Express.js v4.19.2** - Web framework (downgraded from v5 for path-to-regexp compatibility)
- **MongoDB + Mongoose v8.15.1** - Database (with updated connection options)
- **Pinata SDK** - IPFS uploads
- **Node-cron** - Background jobs
- **Joi** - Request validation
- **Multer** - File uploads
- **Morgan** - HTTP logging

## 📁 Project Structure

```
Backend/
├── controllers/           # Request handlers
├── models/               # MongoDB schemas
├── routes/               # API routes
├── utils/                # Utility functions
├── config/               # Configuration files
├── jobs/                 # Background jobs
├── index.js             # Main server file
└── package.json         # Dependencies
```

## 🔧 Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   ```env
   # Database - UPDATE WITH YOUR ACTUAL MONGODB CREDENTIALS
   # Go to MongoDB Atlas -> Database Access -> Add New Database User
   # Make sure to whitelist your IP in Network Access
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nft-marketplace?retryWrites=true&w=majority

   # Server
   PORT=5000

   # Pinata IPFS - UPDATE WITH YOUR ACTUAL PINATA CREDENTIALS
   # Get these from https://app.pinata.cloud/keys
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

   # Blockchain (for read-only operations)
   MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
   NFT_CONTRACT_ADDRESS=0x6919B2303c62e822Ad9191B2D70F8D5e9fd10B55

   # App Settings
   AUTO_BUY_ENABLED=true
   AUTO_BUY_INTERVAL_MINUTES=1

   # Note: No private keys needed in backend - all transactions are handled by frontend
   ```

3. **Configure MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster or use existing one
   - Navigate to **Database Access** → **Add New Database User**
   - Create user with appropriate username/password
   - Go to **Network Access** → **Add IP Address** → Add your current IP or `0.0.0.0/0` for testing
   - Update the `MONGODB_URI` in your `.env` file with your actual credentials

4. **Configure Pinata IPFS**
   - Go to [Pinata Cloud](https://app.pinata.cloud/keys)
   - Create new API keys
   - Update `PINATA_API_KEY` and `PINATA_SECRET_API_KEY` in your `.env` file

5. **Run the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Troubleshooting

### Express v5 Compatibility Issues
If you encounter `TypeError: Missing parameter name` errors with path-to-regexp:
- **Solution**: Use Express v4.19.2 (already configured in package.json)
- **Reason**: Express v5 has breaking changes with stricter route parameter validation

### MongoDB Connection Issues
If you see `bad auth : authentication failed`:
1. Verify your MongoDB Atlas credentials in `.env`
2. Ensure the database user exists in MongoDB Atlas
3. Check that your IP is whitelisted in Network Access
4. Make sure the database name in the connection string is correct

### Deprecated MongoDB Options
The following options are no longer needed in modern MongoDB drivers:
- ❌ `useNewUrlParser: true` (removed)
- ❌ `useUnifiedTopology: true` (removed)

### PowerShell Commands
When using PowerShell, use semicolons instead of `&&`:
```bash
# ✅ Correct (PowerShell)
cd Backend; npm install

# ❌ Incorrect (Bash syntax)
cd Backend && npm install
```

## 📡 API Endpoints

### IPFS & Metadata
- `POST /api/nfts/upload` - Upload image and metadata to IPFS
- `POST /api/nfts/mint` - Mint NFT (store in database)

### NFT Management
- `GET /api/nfts` - Get all NFTs (with filtering & pagination)
- `GET /api/nfts/:tokenId` - Get single NFT by ID
- `GET /api/nfts/stats` - Get NFT statistics

### Listing Management
- `POST /api/nfts/list-sale` - List NFT for sale
- `POST /api/nfts/delist-sale` - Delist NFT from sale
- `POST /api/nfts/list-rent` - List NFT for rent
- `POST /api/nfts/delist-rent` - Delist NFT from rent

### PR NFT Features
- `POST /api/nfts/like` - Like a PR NFT
- `POST /api/nfts/dislike` - Dislike a PR NFT
- `GET /api/nfts/finalized` - Get finalized PR NFTs ready for purchase

### Auto-Purchase System
- `POST /api/nfts/mark-purchased` - Mark NFT as purchased (after blockchain tx)
- `GET /api/nfts/pr-job/status` - Get PR job status and stats
- `POST /api/nfts/pr-job/trigger` - Manually trigger PR finalization

### Health Check
- `GET /health` - Server health status

## 🗄️ Database Schema

### NFT Document
```javascript
{
  tokenId: Number,              // Unique token ID
  owner: String,                // Owner's wallet address
  metadataURI: String,          // IPFS metadata URL
  imageURL: String,             // IPFS image URL
  name: String,                 // NFT name
  description: String,          // NFT description
  basePrice: Number,            // Base price in ETH
  isForSale: Boolean,           // Listed for sale
  isForRent: Boolean,           // Listed for rent
  rentalFee: Number,            // Rental fee per day
  rentalDuration: Number,       // Rental duration in hours
  rentalEndTime: Date,          // Rental end time
  renter: String,               // Current renter address
  likes: Number,                // PR NFT likes
  dislikes: Number,             // PR NFT dislikes
  isPR: Boolean,                // Is Price-Reactive NFT
  prEndTime: Date,              // PR period end time
  isReadyForAutoPurchase: Boolean, // Ready for frontend auto-purchase
  finalizedAt: Date,            // When PR was finalized
  purchasedAt: Date,            // When purchased
  purchaseTransactionHash: String, // Blockchain transaction hash
  attributes: Array,            // NFT attributes
  mintedAt: Date,               // Mint timestamp
  lastSalePrice: Number,        // Last sale price
  totalSales: Number            // Total number of sales
}
```

## 🤖 Background Jobs

### PR Auto-finalization Job
- **Purpose**: Automatically finalize expired PR NFT prices
- **Frequency**: Every 1 minute (configurable)
- **Process**:
  1. Find expired PR NFTs (`isPR: true`, `prEndTime < now`)
  2. Calculate final price: `basePrice + (likes - dislikes) * 0.0001 ETH`
  3. Update NFT: set `isReadyForAutoPurchase: true`, `finalizedAt: now`
  4. Frontend can then query finalized NFTs and execute purchases

## 🔍 PR NFT Price Formula

```javascript
finalPrice = basePrice + (likes - dislikes) * 0.0001 ETH
// Minimum price is always basePrice
```

## 📝 Example API Usage

### Upload NFT to IPFS
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('name', 'My NFT');
formData.append('description', 'Amazing NFT');

const response = await fetch('/api/nfts/upload', {
  method: 'POST',
  body: formData
});
```

### Mint NFT
```javascript
const response = await fetch('/api/nfts/mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    owner: '0x123...',
    basePrice: 0.1,
    isPR: true,
    prDurationHours: 24,
    name: 'My NFT',
    description: 'Amazing NFT',
    metadataURI: 'ipfs://...',
    imageURL: 'ipfs://...'
  })
});
```

### Get Finalized NFTs (for frontend auto-purchase)
```javascript
const response = await fetch('/api/nfts/finalized?page=1&limit=10');
const { nfts } = await response.json();
// Frontend can now purchase these NFTs at their finalized prices
```

### Mark NFT as Purchased
```javascript
// After frontend completes blockchain transaction
const response = await fetch('/api/nfts/mark-purchased', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: 1,
    buyerAddress: '0x456...',
    transactionHash: '0xabc123...'
  })
});
```

## 🔒 Security Features

- **Input Validation** - Joi schemas for all endpoints
- **Address Validation** - Ethereum address format checking
- **File Upload Limits** - 50MB max file size
- **Error Handling** - Comprehensive error responses
- **CORS Protection** - Configurable CORS settings

## 🚫 What This Backend Does NOT Do

- ❌ Blockchain transactions (handled by frontend)
- ❌ Private key management
- ❌ Smart contract interactions
- ❌ Wallet connections
- ❌ Gas estimation
- ❌ Transaction signing

## 📊 Monitoring

- **Health Check**: `GET /health`
- **NFT Statistics**: `GET /api/nfts/stats`
- **PR Job Status**: `GET /api/nfts/pr-job/status`
- **HTTP Logging**: Morgan middleware

## 🐛 Error Handling

All endpoints return standardized error responses:
```javascript
{
  "error": "Error message",
  "message": "Detailed description"
}
```

Validation errors include field-specific details:
```javascript
{
  "error": "Validation failed",
  "details": [
    {
      "field": "basePrice",
      "message": "Must be a positive number",
      "value": -1
    }
  ]
}
```

## 🎯 Production Deployment

1. Set production environment variables
2. Use PM2 or similar for process management
3. Set up MongoDB replica set for production
4. Configure reverse proxy (Nginx)
5. Enable HTTPS
6. Set up monitoring and logging

## 📄 License

MIT License 