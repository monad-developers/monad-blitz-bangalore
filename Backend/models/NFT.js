const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  metadataURI: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  isForSale: {
    type: Boolean,
    default: false,
    index: true
  },
  isForRent: {
    type: Boolean,
    default: false,
    index: true
  },
  rentalFee: {
    type: Number,
    default: 0,
    min: 0
  },
  rentalDuration: {
    type: Number, // in hours
    default: 0,
    min: 0
  },
  rentalEndTime: {
    type: Date,
    default: null
  },
  renter: {
    type: String,
    default: null,
    lowercase: true
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  dislikes: {
    type: Number,
    default: 0,
    min: 0
  },
  isPR: {
    type: Boolean,
    default: false,
    index: true
  },
  prEndTime: {
    type: Date,
    default: null,
    index: true
  },
  // PR Auto-finalization fields
  isReadyForAutoPurchase: {
    type: Boolean,
    default: false,
    index: true
  },
  finalizedAt: {
    type: Date,
    default: null,
    index: true
  },
  purchasedAt: {
    type: Date,
    default: null
  },
  purchaseTransactionHash: {
    type: String,
    default: null
  },
  // Additional metadata
  attributes: [{
    trait_type: String,
    value: String
  }],
  // Transaction history
  mintedAt: {
    type: Date,
    default: Date.now
  },
  lastSalePrice: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for calculated PR price
nftSchema.virtual('currentPrice').get(function() {
  if (!this.isPR) {
    return this.basePrice;
  }
  
  // Formula: finalPrice = basePrice + (likes - dislikes) * 0.0001 ETH
  const priceAdjustment = (this.likes - this.dislikes) * 0.0001;
  const finalPrice = this.basePrice + priceAdjustment;
  
  // Ensure minimum price = basePrice
  return Math.max(finalPrice, this.basePrice);
});

// Virtual field to check if NFT is currently rented
nftSchema.virtual('isCurrentlyRented').get(function() {
  return this.renter && this.rentalEndTime && new Date() < this.rentalEndTime;
});

// Virtual field to check if PR period is active
nftSchema.virtual('isPRActive').get(function() {
  return this.isPR && this.prEndTime && new Date() < this.prEndTime;
});

// Indexes for better query performance
nftSchema.index({ isPR: 1, prEndTime: 1 });
nftSchema.index({ owner: 1, isForSale: 1 });
nftSchema.index({ isForRent: 1, rentalEndTime: 1 });
nftSchema.index({ isReadyForAutoPurchase: 1, finalizedAt: 1 });
nftSchema.index({ createdAt: -1 });

// Pre-save middleware to validate business logic
nftSchema.pre('save', function(next) {
  // Cannot be for sale and for rent at the same time
  if (this.isForSale && this.isForRent) {
    return next(new Error('NFT cannot be listed for both sale and rent simultaneously'));
  }
  
  // If not for rent, clear rental fields
  if (!this.isForRent) {
    this.rentalFee = 0;
    this.rentalDuration = 0;
    this.rentalEndTime = null;
    this.renter = null;
  }
  
  // If not PR, clear PR fields
  if (!this.isPR) {
    this.prEndTime = null;
  }
  
  // If not ready for auto-purchase, clear related fields
  if (!this.isReadyForAutoPurchase) {
    this.finalizedAt = null;
  }
  
  next();
});

// Static methods
nftSchema.statics.findByOwner = function(owner) {
  return this.find({ owner: owner.toLowerCase() });
};

nftSchema.statics.findForSale = function() {
  return this.find({ isForSale: true });
};

nftSchema.statics.findForRent = function() {
  return this.find({ isForRent: true });
};

nftSchema.statics.findPRNFTs = function() {
  return this.find({ isPR: true });
};

nftSchema.statics.findExpiredPRNFTs = function() {
  return this.find({
    isPR: true,
    prEndTime: { $lt: new Date() }
  });
};

nftSchema.statics.findReadyForAutoPurchase = function() {
  return this.find({
    isReadyForAutoPurchase: true,
    isForSale: true
  });
};

// Instance methods
nftSchema.methods.calculatePRPrice = function() {
  if (!this.isPR) {
    return this.basePrice;
  }
  
  const priceAdjustment = (this.likes - this.dislikes) * 0.0001;
  const finalPrice = this.basePrice + priceAdjustment;
  
  return Math.max(finalPrice, this.basePrice);
};

nftSchema.methods.addLike = function() {
  if (this.isPR) {
    this.likes += 1;
    return this.save();
  }
  throw new Error('Can only like PR NFTs');
};

nftSchema.methods.addDislike = function() {
  if (this.isPR) {
    this.dislikes += 1;
    return this.save();
  }
  throw new Error('Can only dislike PR NFTs');
};

module.exports = mongoose.model('NFT', nftSchema); 