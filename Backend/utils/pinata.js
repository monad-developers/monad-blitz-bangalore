const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

class PinataService {
  constructor() {
    this.pinata = null;
    this.init();
  }

  init() {
    try {
      if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
        console.warn('⚠️ Pinata credentials not found. IPFS uploads will not work.');
        return;
      }

      this.pinata = new pinataSDK(
        process.env.PINATA_API_KEY,
        process.env.PINATA_SECRET_API_KEY
      );

      console.log('📌 Pinata service initialized');
    } catch (error) {
      console.error('❌ Pinata initialization failed:', error);
    }
  }

  // Test Pinata connection
  async testConnection() {
    try {
      if (!this.pinata) {
        throw new Error('Pinata not initialized');
      }

      const result = await this.pinata.testAuthentication();
      console.log('📌 Pinata connection test:', result);
      return result;
    } catch (error) {
      console.error('❌ Pinata connection test failed:', error);
      throw error;
    }
  }

  // Upload file to IPFS
  async uploadFile(fileBuffer, fileName, options = {}) {
    try {
      if (!this.pinata) {
        throw new Error('Pinata not initialized');
      }

      // Create a readable stream from buffer for Pinata SDK v2+
      const Readable = require('stream').Readable;
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null); // Signal end of stream

      const defaultOptions = {
        pinataMetadata: {
          name: fileName,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: 'nft-image'
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      const uploadOptions = { ...defaultOptions, ...options };

      const result = await this.pinata.pinFileToIPFS(readableStream, uploadOptions);
      
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      console.log(`📌 File uploaded to IPFS: ${ipfsUrl}`);
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: ipfsUrl,
        pinSize: result.PinSize,
        timestamp: result.Timestamp
      };

    } catch (error) {
      console.error('❌ Error uploading file to IPFS:', error);
      throw error;
    }
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata, options = {}) {
    try {
      if (!this.pinata) {
        throw new Error('Pinata not initialized');
      }

      const defaultOptions = {
        pinataMetadata: {
          name: `${metadata.name || 'NFT'}-metadata`,
          keyvalues: {
            uploadedAt: new Date().toISOString(),
            type: 'nft-metadata',
            nftName: metadata.name || 'Unknown'
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      const uploadOptions = { ...defaultOptions, ...options };

      const result = await this.pinata.pinJSONToIPFS(metadata, uploadOptions);
      
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      console.log(`📌 Metadata uploaded to IPFS: ${metadataUrl}`);
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        metadataUrl: metadataUrl,
        pinSize: result.PinSize,
        timestamp: result.Timestamp
      };

    } catch (error) {
      console.error('❌ Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  // Upload image and create metadata in one go
  async uploadNFTData(imageBuffer, fileName, nftData) {
    try {
      // First upload the image
      const imageResult = await this.uploadFile(imageBuffer, fileName, {
        pinataMetadata: {
          name: `${nftData.name}-image`,
          keyvalues: {
            type: 'nft-image',
            nftName: nftData.name
          }
        }
      });

      if (!imageResult.success) {
        throw new Error('Failed to upload image');
      }

      // Create metadata with image URL
      const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: imageResult.ipfsUrl,
        attributes: nftData.attributes || [],
        external_url: nftData.external_url || '',
        background_color: nftData.background_color || '',
        animation_url: nftData.animation_url || '',
        youtube_url: nftData.youtube_url || ''
      };

      // Upload metadata
      const metadataResult = await this.uploadMetadata(metadata, {
        pinataMetadata: {
          name: `${nftData.name}-metadata`,
          keyvalues: {
            type: 'nft-metadata',
            nftName: nftData.name,
            imageHash: imageResult.ipfsHash
          }
        }
      });

      if (!metadataResult.success) {
        throw new Error('Failed to upload metadata');
      }

      return {
        success: true,
        imageUrl: imageResult.ipfsUrl,
        imageHash: imageResult.ipfsHash,
        metadataUrl: metadataResult.metadataUrl,
        metadataHash: metadataResult.ipfsHash,
        metadata: metadata
      };

    } catch (error) {
      console.error('❌ Error uploading NFT data:', error);
      throw error;
    }
  }

  // Get pinned files
  async getPinnedFiles(options = {}) {
    try {
      if (!this.pinata) {
        throw new Error('Pinata not initialized');
      }

      const result = await this.pinata.pinList(options);
      return result;
    } catch (error) {
      console.error('❌ Error getting pinned files:', error);
      throw error;
    }
  }

  // Unpin file
  async unpinFile(ipfsHash) {
    try {
      if (!this.pinata) {
        throw new Error('Pinata not initialized');
      }

      const result = await this.pinata.unpin(ipfsHash);
      console.log(`📌 Unpinned file: ${ipfsHash}`);
      return result;
    } catch (error) {
      console.error('❌ Error unpinning file:', error);
      throw error;
    }
  }

  // Get file from IPFS
  async getFile(ipfsHash) {
    try {
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error getting file from IPFS:', error);
      throw error;
    }
  }

  // Validate IPFS hash
  isValidIPFSHash(hash) {
    // Basic IPFS hash validation (CIDv0 and CIDv1)
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^b[A-Za-z2-7]{58}$/;
    
    return cidv0Regex.test(hash) || cidv1Regex.test(hash);
  }

  // Get IPFS URL from hash
  getIPFSUrl(hash) {
    if (!this.isValidIPFSHash(hash)) {
      throw new Error('Invalid IPFS hash');
    }
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}

// Create singleton instance
const pinataService = new PinataService();

module.exports = pinataService; 