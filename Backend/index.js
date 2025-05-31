const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const nftRoutes = require('./routes/nftRoutes');

// Import background jobs
const prAutoBuyJob = require('./jobs/prAutoBuyJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Routes
app.use('/api/nfts', nftRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'NFT Marketplace Backend is running (Database + IPFS only)',
    timestamp: new Date().toISOString(),
    features: [
      'MongoDB Database Operations',
      'IPFS File & Metadata Uploads via Pinata',
      'PR NFT Auto-finalization Job',
      'REST API for NFT Management'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 NFT Marketplace Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 Features: Database + IPFS only (no blockchain transactions)`);
    
    // Start background jobs
    if (process.env.AUTO_BUY_ENABLED === 'true') {
      prAutoBuyJob.start();
      console.log('🤖 PR Auto-finalization job started');
    }
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app; 