const express = require('express');
const { NFTController, upload } = require('../controllers/nftController');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Routes working!' });
});

// Upload image and metadata to IPFS
router.post('/upload', 
  upload.single('image'),
  validate(schemas.uploadNFT),
  NFTController.uploadToIPFS
);

// Mint NFT and store in database
router.post('/mint',
  validate(schemas.mintNFT),
  NFTController.mintNFT
);

// List NFT for sale
router.post('/list-sale',
  validate(schemas.listForSale),
  NFTController.listForSale
);

// Delist NFT from sale
router.post('/delist-sale',
  validate(schemas.delistFromSale),
  NFTController.delistFromSale
);

// List NFT for rent
router.post('/list-rent',
  validate(schemas.listForRent),
  NFTController.listForRent
);

// Delist NFT from rent
router.post('/delist-rent',
  validate(schemas.delistFromRent),
  NFTController.delistFromRent
);

// Like PR NFT
router.post('/like',
  validate(schemas.likeDislikeNFT),
  NFTController.likeNFT
);

// Dislike PR NFT
router.post('/dislike',
  validate(schemas.likeDislikeNFT),
  NFTController.dislikeNFT
);

// Mark NFT as purchased (called after frontend completes transaction)
router.post('/mark-purchased',
  validate(schemas.markPurchased),
  NFTController.markNFTAsPurchased
);

// Get all NFTs with filtering and pagination (must be before /:tokenId)
router.get('/',
  validate(schemas.getNFTsQuery, 'query'),
  NFTController.getAllNFTs
);

// Get NFT statistics (specific route before /:tokenId)
router.get('/stats',
  NFTController.getNFTStats
);

// Get finalized NFTs ready for auto-purchase (specific route before /:tokenId)
router.get('/finalized',
  NFTController.getFinalizedNFTs
);

// Get PR finalization job status and stats (specific route before /:tokenId)
router.get('/pr-job/status',
  NFTController.getPRJobStatus
);

// Manually trigger PR finalization (specific route before /:tokenId)
router.post('/pr-job/trigger',
  NFTController.triggerPRFinalization
);

// Get single NFT by token ID (must be LAST among GET routes)
router.get('/:tokenId',
  (req, res, next) => {
    // Simple validation
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId) || tokenId < 0) {
      return res.status(400).json({ error: 'Invalid token ID' });
    }
    req.params.tokenId = tokenId.toString();
    next();
  },
  NFTController.getNFTById
);

module.exports = router; 