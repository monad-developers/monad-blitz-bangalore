import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Upload image and metadata to IPFS via backend
 * @param {File} imageFile - The image file to upload
 * @param {Object} metadata - NFT metadata (name, description, attributes)
 * @returns {Promise<Object>} Upload response with IPFS URLs
 */
export const uploadToIPFS = async (imageFile, metadata) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('name', metadata.name);
    formData.append('description', metadata.description);
    
    // Add attributes if provided
    if (metadata.attributes) {
      formData.append('attributes', JSON.stringify(metadata.attributes));
    }

    const response = await axios.post(`${API_BASE_URL}/api/nfts/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(error.response?.data?.error || 'Failed to upload to IPFS');
  }
};

/**
 * Get IPFS URL from hash
 * @param {string} hash - IPFS hash or URL
 * @returns {string} Full IPFS URL
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '';
  
  // If it's already a full URL, return it as is
  if (hash.startsWith('http://') || hash.startsWith('https://')) {
    return hash;
  }
  
  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace('ipfs://', '');
  
  // Return gateway URL
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {boolean} Whether file is valid
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 50MB');
  }

  return true;
}; 