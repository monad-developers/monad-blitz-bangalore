const NFT = require('../models/NFT');
const pinataService = require('../utils/pinata');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

class NFTController {
  // Upload image and metadata to IPFS
  static async uploadToIPFS(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { name, description, attributes, external_url, background_color, animation_url, youtube_url } = req.body;

      // Parse attributes if it's a string
      let parsedAttributes = [];
      if (attributes) {
        try {
          parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        } catch (error) {
          return res.status(400).json({ error: 'Invalid attributes format' });
        }
      }

      const nftData = {
        name,
        description,
        attributes: parsedAttributes,
        external_url,
        background_color,
        animation_url,
        youtube_url
      };

      // Upload to IPFS
      const result = await pinataService.uploadNFTData(
        req.file.buffer,
        req.file.originalname,
        nftData
      );

      res.status(200).json({
        success: true,
        message: 'NFT data uploaded to IPFS successfully',
        data: result
      });

    } catch (error) {
      console.error('Upload to IPFS error:', error);
      res.status(500).json({
        error: 'Failed to upload to IPFS',
        message: error.message
      });
    }
  }

  // Mint NFT and store in database
  static async mintNFT(req, res) {
    try {
      const { 
        owner, 
        basePrice, 
        isPR, 
        prDurationHours, 
        name, 
        description, 
        attributes,
        metadataURI,
        imageURL 
      } = req.body;

      // Check if NFT with this metadata URI already exists
      const existingNFT = await NFT.findOne({ metadataURI });
      if (existingNFT) {
        return res.status(400).json({ error: 'NFT with this metadata already exists' });
      }

      // Generate next token ID (simple increment)
      const lastNFT = await NFT.findOne().sort({ tokenId: -1 });
      const tokenId = lastNFT ? lastNFT.tokenId + 1 : 1;

      // Calculate PR end time if applicable
      let prEndTime = null;
      if (isPR && prDurationHours) {
        prEndTime = new Date(Date.now() + prDurationHours * 60 * 60 * 1000);
      }

      // Create NFT document
      const nft = new NFT({
        tokenId,
        owner: owner.toLowerCase(),
        metadataURI,
        imageURL,
        name,
        description,
        basePrice,
        isPR: isPR || false,
        prEndTime,
        attributes: attributes || [],
        mintedAt: new Date()
      });

      await nft.save();

      res.status(201).json({
        success: true,
        message: 'NFT minted successfully',
        data: {
          tokenId: nft.tokenId,
          owner: nft.owner,
          metadataURI: nft.metadataURI,
          imageURL: nft.imageURL,
          basePrice: nft.basePrice,
          isPR: nft.isPR,
          prEndTime: nft.prEndTime,
          currentPrice: nft.currentPrice
        }
      });

    } catch (error) {
      console.error('Mint NFT error:', error);
      res.status(500).json({
        error: 'Failed to mint NFT',
        message: error.message
      });
    }
  }

  // List NFT for sale
  static async listForSale(req, res) {
    try {
      const { tokenId, owner, basePrice, isPR, prDurationHours } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      // Verify ownership
      if (nft.owner !== owner.toLowerCase()) {
        return res.status(403).json({ error: 'Only the owner can list this NFT for sale' });
      }

      // Check if NFT is currently rented
      if (nft.isCurrentlyRented) {
        return res.status(400).json({ error: 'Cannot list rented NFT for sale' });
      }

      // Update NFT
      nft.isForSale = true;
      nft.isForRent = false; // Cannot be for rent and sale simultaneously
      
      if (basePrice !== undefined) {
        nft.basePrice = basePrice;
      }

      if (isPR !== undefined) {
        nft.isPR = isPR;
        if (isPR && prDurationHours) {
          nft.prEndTime = new Date(Date.now() + prDurationHours * 60 * 60 * 1000);
        } else if (!isPR) {
          nft.prEndTime = null;
        }
      }

      await nft.save();

      res.status(200).json({
        success: true,
        message: 'NFT listed for sale successfully',
        data: {
          tokenId: nft.tokenId,
          isForSale: nft.isForSale,
          basePrice: nft.basePrice,
          currentPrice: nft.currentPrice,
          isPR: nft.isPR,
          prEndTime: nft.prEndTime
        }
      });

    } catch (error) {
      console.error('List for sale error:', error);
      res.status(500).json({
        error: 'Failed to list NFT for sale',
        message: error.message
      });
    }
  }

  // Delist NFT from sale
  static async delistFromSale(req, res) {
    try {
      const { tokenId, owner } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      // Verify ownership
      if (nft.owner !== owner.toLowerCase()) {
        return res.status(403).json({ error: 'Only the owner can delist this NFT' });
      }

      // Update NFT
      nft.isForSale = false;
      nft.isPR = false;
      nft.prEndTime = null;

      await nft.save();

      res.status(200).json({
        success: true,
        message: 'NFT delisted from sale successfully',
        data: {
          tokenId: nft.tokenId,
          isForSale: nft.isForSale,
          isPR: nft.isPR
        }
      });

    } catch (error) {
      console.error('Delist from sale error:', error);
      res.status(500).json({
        error: 'Failed to delist NFT from sale',
        message: error.message
      });
    }
  }

  // List NFT for rent
  static async listForRent(req, res) {
    try {
      const { tokenId, owner, rentalFee, rentalDuration } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      // Verify ownership
      if (nft.owner !== owner.toLowerCase()) {
        return res.status(403).json({ error: 'Only the owner can list this NFT for rent' });
      }

      // Check if NFT is for sale
      if (nft.isForSale) {
        return res.status(400).json({ error: 'Cannot list NFT for rent while it is for sale' });
      }

      // Check if NFT is currently rented
      if (nft.isCurrentlyRented) {
        return res.status(400).json({ error: 'NFT is already rented' });
      }

      // Update NFT
      nft.isForRent = true;
      nft.rentalFee = rentalFee;
      nft.rentalDuration = rentalDuration;

      await nft.save();

      res.status(200).json({
        success: true,
        message: 'NFT listed for rent successfully',
        data: {
          tokenId: nft.tokenId,
          isForRent: nft.isForRent,
          rentalFee: nft.rentalFee,
          rentalDuration: nft.rentalDuration
        }
      });

    } catch (error) {
      console.error('List for rent error:', error);
      res.status(500).json({
        error: 'Failed to list NFT for rent',
        message: error.message
      });
    }
  }

  // Delist NFT from rent
  static async delistFromRent(req, res) {
    try {
      const { tokenId, owner } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      // Verify ownership
      if (nft.owner !== owner.toLowerCase()) {
        return res.status(403).json({ error: 'Only the owner can delist this NFT' });
      }

      // Check if NFT is currently rented
      if (nft.isCurrentlyRented) {
        return res.status(400).json({ error: 'Cannot delist NFT while it is rented' });
      }

      // Update NFT
      nft.isForRent = false;
      nft.rentalFee = 0;
      nft.rentalDuration = 0;

      await nft.save();

      res.status(200).json({
        success: true,
        message: 'NFT delisted from rent successfully',
        data: {
          tokenId: nft.tokenId,
          isForRent: nft.isForRent
        }
      });

    } catch (error) {
      console.error('Delist from rent error:', error);
      res.status(500).json({
        error: 'Failed to delist NFT from rent',
        message: error.message
      });
    }
  }

  // Like PR NFT
  static async likeNFT(req, res) {
    try {
      const { tokenId } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      if (!nft.isPR) {
        return res.status(400).json({ error: 'Can only like PR NFTs' });
      }

      if (!nft.isPRActive) {
        return res.status(400).json({ error: 'PR period has ended' });
      }

      await nft.addLike();

      res.status(200).json({
        success: true,
        message: 'NFT liked successfully',
        data: {
          tokenId: nft.tokenId,
          likes: nft.likes,
          dislikes: nft.dislikes,
          currentPrice: nft.currentPrice
        }
      });

    } catch (error) {
      console.error('Like NFT error:', error);
      res.status(500).json({
        error: 'Failed to like NFT',
        message: error.message
      });
    }
  }

  // Dislike PR NFT
  static async dislikeNFT(req, res) {
    try {
      const { tokenId } = req.body;

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      if (!nft.isPR) {
        return res.status(400).json({ error: 'Can only dislike PR NFTs' });
      }

      if (!nft.isPRActive) {
        return res.status(400).json({ error: 'PR period has ended' });
      }

      await nft.addDislike();

      res.status(200).json({
        success: true,
        message: 'NFT disliked successfully',
        data: {
          tokenId: nft.tokenId,
          likes: nft.likes,
          dislikes: nft.dislikes,
          currentPrice: nft.currentPrice
        }
      });

    } catch (error) {
      console.error('Dislike NFT error:', error);
      res.status(500).json({
        error: 'Failed to dislike NFT',
        message: error.message
      });
    }
  }

  // Get all NFTs with filtering and pagination
  static async getAllNFTs(req, res) {
    try {
      const {
        owner,
        isForSale,
        isForRent,
        isPR,
        page,
        limit,
        sortBy,
        sortOrder,
        search
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (owner) filter.owner = owner.toLowerCase();
      if (isForSale !== undefined) filter.isForSale = isForSale;
      if (isForRent !== undefined) filter.isForRent = isForRent;
      if (isPR !== undefined) filter.isPR = isPR;

      // Add search functionality
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [nfts, total] = await Promise.all([
        NFT.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        NFT.countDocuments(filter)
      ]);

      // Add virtual fields manually for lean queries
      const enrichedNFTs = nfts.map(nft => ({
        ...nft,
        currentPrice: nft.isPR ? 
          Math.max(nft.basePrice + (nft.likes - nft.dislikes) * 0.0001, nft.basePrice) : 
          nft.basePrice,
        isCurrentlyRented: nft.renter && nft.rentalEndTime && new Date() < nft.rentalEndTime,
        isPRActive: nft.isPR && nft.prEndTime && new Date() < nft.prEndTime
      }));

      res.status(200).json({
        success: true,
        data: {
          nfts: enrichedNFTs,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get all NFTs error:', error);
      res.status(500).json({
        error: 'Failed to fetch NFTs',
        message: error.message
      });
    }
  }

  // Get single NFT by token ID
  static async getNFTById(req, res) {
    try {
      const { tokenId } = req.params;
      const tokenIdNumber = parseInt(tokenId, 10);

      if (isNaN(tokenIdNumber) || tokenIdNumber < 0) {
        return res.status(400).json({ error: 'Invalid token ID' });
      }

      const nft = await NFT.findOne({ tokenId: tokenIdNumber });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      res.status(200).json({
        success: true,
        data: nft
      });

    } catch (error) {
      console.error('Get NFT by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch NFT',
        message: error.message
      });
    }
  }

  // Get NFT statistics
  static async getNFTStats(req, res) {
    try {
      const stats = await NFT.aggregate([
        {
          $group: {
            _id: null,
            totalNFTs: { $sum: 1 },
            totalForSale: { $sum: { $cond: ['$isForSale', 1, 0] } },
            totalForRent: { $sum: { $cond: ['$isForRent', 1, 0] } },
            totalPR: { $sum: { $cond: ['$isPR', 1, 0] } },
            totalReadyForAutoPurchase: { $sum: { $cond: ['$isReadyForAutoPurchase', 1, 0] } },
            averagePrice: { $avg: '$basePrice' },
            totalLikes: { $sum: '$likes' },
            totalDislikes: { $sum: '$dislikes' }
          }
        }
      ]);

      const result = stats[0] || {
        totalNFTs: 0,
        totalForSale: 0,
        totalForRent: 0,
        totalPR: 0,
        totalReadyForAutoPurchase: 0,
        averagePrice: 0,
        totalLikes: 0,
        totalDislikes: 0
      };

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get NFT stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch NFT statistics',
        message: error.message
      });
    }
  }

  // Get finalized NFTs ready for auto-purchase (for frontend)
  static async getFinalizedNFTs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'finalizedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [nfts, total] = await Promise.all([
        NFT.find({
          isReadyForAutoPurchase: true,
          isForSale: true
        })
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        NFT.countDocuments({
          isReadyForAutoPurchase: true,
          isForSale: true
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          nfts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get finalized NFTs error:', error);
      res.status(500).json({
        error: 'Failed to fetch finalized NFTs',
        message: error.message
      });
    }
  }

  // Mark NFT as purchased (called after frontend completes blockchain transaction)
  static async markNFTAsPurchased(req, res) {
    try {
      const { tokenId, buyerAddress, transactionHash } = req.body;

      if (!tokenId || !buyerAddress || !transactionHash) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['tokenId', 'buyerAddress', 'transactionHash']
        });
      }

      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }

      if (!nft.isReadyForAutoPurchase) {
        return res.status(400).json({ error: 'NFT is not ready for auto-purchase' });
      }

      const previousOwner = nft.owner;
      const salePrice = nft.basePrice;

      // Update NFT ownership and status
      nft.owner = buyerAddress.toLowerCase();
      nft.isForSale = false;
      nft.isReadyForAutoPurchase = false;
      nft.lastSalePrice = salePrice;
      nft.totalSales += 1;
      nft.purchasedAt = new Date();
      nft.purchaseTransactionHash = transactionHash;

      await nft.save();

      console.log(`✅ NFT ${tokenId} marked as purchased by ${buyerAddress} for ${salePrice} ETH`);

      res.status(200).json({
        success: true,
        message: 'NFT marked as purchased successfully',
        data: {
          tokenId: nft.tokenId,
          previousOwner,
          newOwner: buyerAddress,
          salePrice,
          transactionHash,
          purchasedAt: nft.purchasedAt
        }
      });

    } catch (error) {
      console.error('Mark NFT as purchased error:', error);
      res.status(500).json({
        error: 'Failed to mark NFT as purchased',
        message: error.message
      });
    }
  }

  // Get PR finalization job status and stats
  static async getPRJobStatus(req, res) {
    try {
      const prAutoBuyJob = require('../jobs/prAutoBuyJob');
      
      const [jobStatus, finalizationStats] = await Promise.all([
        prAutoBuyJob.getStatus(),
        prAutoBuyJob.getFinalizationStats()
      ]);

      res.status(200).json({
        success: true,
        data: {
          jobStatus,
          stats: finalizationStats
        }
      });

    } catch (error) {
      console.error('Get PR job status error:', error);
      res.status(500).json({
        error: 'Failed to get PR job status',
        message: error.message
      });
    }
  }

  // Manually trigger PR finalization (for testing/admin)
  static async triggerPRFinalization(req, res) {
    try {
      const prAutoBuyJob = require('../jobs/prAutoBuyJob');
      
      // Trigger manual finalization
      await prAutoBuyJob.triggerManual();

      res.status(200).json({
        success: true,
        message: 'PR finalization job triggered manually'
      });

    } catch (error) {
      console.error('Trigger PR finalization error:', error);
      res.status(500).json({
        error: 'Failed to trigger PR finalization',
        message: error.message
      });
    }
  }
}

module.exports = { NFTController, upload }; 