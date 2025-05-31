const cron = require('node-cron');
const NFT = require('../models/NFT');

class PRAutoBuyJob {
  constructor() {
    this.isRunning = false;
    this.intervalMinutes = parseInt(process.env.AUTO_BUY_INTERVAL_MINUTES) || 1;
    this.cronExpression = `*/${this.intervalMinutes} * * * *`; // Every N minutes
    this.job = null;
  }

  // Start the cron job
  start() {
    if (this.job) {
      console.log('⚠️ PR Auto-finalization job is already running');
      return;
    }

    console.log(`🤖 Starting PR Auto-finalization job (every ${this.intervalMinutes} minute(s))`);
    
    this.job = cron.schedule(this.cronExpression, async () => {
      await this.executeAutoFinalization();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('✅ PR Auto-finalization job scheduled successfully');
  }

  // Stop the cron job
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      console.log('🛑 PR Auto-finalization job stopped');
    }
  }

  // Execute the auto-finalization logic
  async executeAutoFinalization() {
    if (this.isRunning) {
      console.log('⏳ PR Auto-finalization job already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('🔍 Checking for expired PR NFTs...');

      // Find all expired PR NFTs that are still for sale
      const expiredPRNFTs = await NFT.find({
        isPR: true,
        isForSale: true,
        prEndTime: { $lt: new Date() }
      });

      if (expiredPRNFTs.length === 0) {
        console.log('✅ No expired PR NFTs found');
        return;
      }

      console.log(`📦 Found ${expiredPRNFTs.length} expired PR NFT(s) to finalize`);

      // Process each expired PR NFT
      const results = await Promise.allSettled(
        expiredPRNFTs.map(nft => this.finalizePRNFT(nft))
      );

      // Log results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      console.log(`📊 Auto-finalization completed: ${successful} successful, ${failed} failed`);

      if (failed > 0) {
        const failures = results
          .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
          .map(r => r.reason || r.value?.error);
        
        console.log('❌ Failed finalizations:', failures);
      }

    } catch (error) {
      console.error('❌ Error in PR Auto-finalization job:', error);
    } finally {
      this.isRunning = false;
      const duration = Date.now() - startTime;
      console.log(`⏱️ PR Auto-finalization job completed in ${duration}ms`);
    }
  }

  // Process individual PR NFT - finalize price only
  async finalizePRNFT(nft) {
    try {
      console.log(`🔄 Finalizing NFT ${nft.tokenId}: ${nft.name}`);

      // Calculate final price
      const finalPrice = nft.calculatePRPrice();
      
      console.log(`💰 NFT ${nft.tokenId} final price: ${finalPrice} ETH (base: ${nft.basePrice}, likes: ${nft.likes}, dislikes: ${nft.dislikes})`);

      // Update NFT to finalized state (ready for frontend purchase)
      nft.isPR = false; // Mark as no longer in PR mode
      nft.prEndTime = null;
      nft.basePrice = finalPrice; // Set the base price to the final calculated price
      
      // Add a flag to indicate this NFT is ready for auto-purchase by frontend
      nft.isReadyForAutoPurchase = true;
      nft.finalizedAt = new Date();

      await nft.save();

      console.log(`✅ Successfully finalized NFT ${nft.tokenId} at price ${finalPrice} ETH`);
      console.log(`🎯 NFT ${nft.tokenId} is now ready for frontend auto-purchase`);

      return {
        success: true,
        tokenId: nft.tokenId,
        finalPrice: finalPrice,
        originalBasePrice: nft.basePrice,
        likes: nft.likes,
        dislikes: nft.dislikes,
        priceAdjustment: finalPrice - nft.basePrice
      };

    } catch (error) {
      console.error(`❌ Failed to finalize NFT ${nft.tokenId}:`, error.message);
      
      // Log the failure but don't stop the entire job
      return {
        success: false,
        tokenId: nft.tokenId,
        error: error.message
      };
    }
  }

  // Get finalized NFTs ready for auto-purchase (for frontend to query)
  async getFinalizedNFTs() {
    try {
      const finalizedNFTs = await NFT.find({
        isReadyForAutoPurchase: true,
        isForSale: true
      }).sort({ finalizedAt: -1 });

      return {
        success: true,
        nfts: finalizedNFTs,
        count: finalizedNFTs.length
      };
    } catch (error) {
      console.error('Error getting finalized NFTs:', error);
      return {
        success: false,
        error: error.message,
        nfts: [],
        count: 0
      };
    }
  }

  // Mark NFT as purchased (to be called after frontend completes purchase)
  async markNFTAsPurchased(tokenId, buyerAddress, transactionHash) {
    try {
      const nft = await NFT.findOne({ tokenId });
      if (!nft) {
        throw new Error('NFT not found');
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
      console.log(`📝 Transaction hash: ${transactionHash}`);

      return {
        success: true,
        nft,
        previousOwner,
        salePrice,
        buyer: buyerAddress,
        transactionHash
      };

    } catch (error) {
      console.error(`❌ Error marking NFT ${tokenId} as purchased:`, error);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerManual() {
    console.log('🔧 Manually triggering PR Auto-finalization job...');
    await this.executeAutoFinalization();
  }

  // Get job status
  getStatus() {
    return {
      isScheduled: !!this.job,
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      cronExpression: this.cronExpression,
      nextRun: this.job ? this.job.nextDate() : null
    };
  }

  // Update interval (requires restart)
  updateInterval(minutes) {
    if (minutes < 1 || minutes > 60) {
      throw new Error('Interval must be between 1 and 60 minutes');
    }

    const wasRunning = !!this.job;
    
    if (wasRunning) {
      this.stop();
    }

    this.intervalMinutes = minutes;
    this.cronExpression = `*/${minutes} * * * *`;

    if (wasRunning) {
      this.start();
    }

    console.log(`🔄 Auto-finalization interval updated to ${minutes} minute(s)`);
  }

  // Get statistics about finalized NFTs
  async getFinalizationStats() {
    try {
      const stats = await NFT.aggregate([
        {
          $match: {
            finalizedAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            totalFinalized: { $sum: 1 },
            totalReadyForPurchase: { 
              $sum: { $cond: ['$isReadyForAutoPurchase', 1, 0] } 
            },
            totalPurchased: { 
              $sum: { $cond: [{ $exists: '$purchasedAt' }, 1, 0] } 
            },
            averageFinalPrice: { $avg: '$basePrice' },
            totalLikes: { $sum: '$likes' },
            totalDislikes: { $sum: '$dislikes' }
          }
        }
      ]);

      return stats[0] || {
        totalFinalized: 0,
        totalReadyForPurchase: 0,
        totalPurchased: 0,
        averageFinalPrice: 0,
        totalLikes: 0,
        totalDislikes: 0
      };
    } catch (error) {
      console.error('Error getting finalization stats:', error);
      return {};
    }
  }
}

// Create singleton instance
const prAutoBuyJob = new PRAutoBuyJob();

module.exports = prAutoBuyJob; 