import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NFT APIs
export const nftAPI = {
  // Get all NFTs with optional filtering
  getAllNFTs: async (params = {}) => {
    const response = await api.get('/api/nfts', { params });
    return response.data;
  },

  // Get single NFT by tokenId
  getNFTById: async (tokenId) => {
    const response = await api.get(`/api/nfts/${tokenId}`);
    return response.data;
  },

  // Get NFT statistics
  getStats: async () => {
    const response = await api.get('/api/nfts/stats');
    return response.data;
  },

  // Mint NFT (save to database)
  mintNFT: async (nftData) => {
    const response = await api.post('/api/nfts/mint', nftData);
    return response.data;
  },

  // Like a PR NFT
  likeNFT: async (tokenId) => {
    const response = await api.post('/api/nfts/like', { tokenId });
    return response.data;
  },

  // Dislike a PR NFT
  dislikeNFT: async (tokenId) => {
    const response = await api.post('/api/nfts/dislike', { tokenId });
    return response.data;
  },

  // List NFT for sale
  listForSale: async (data) => {
    const response = await api.post('/api/nfts/list-sale', data);
    return response.data;
  },

  // Delist NFT from sale
  delistFromSale: async (data) => {
    const response = await api.post('/api/nfts/delist-sale', data);
    return response.data;
  },

  // List NFT for rent
  listForRent: async (data) => {
    const response = await api.post('/api/nfts/list-rent', data);
    return response.data;
  },

  // Delist NFT from rent
  delistFromRent: async (data) => {
    const response = await api.post('/api/nfts/delist-rent', data);
    return response.data;
  },

  // Get finalized PR NFTs ready for purchase
  getFinalizedNFTs: async (params = {}) => {
    const response = await api.get('/api/nfts/finalized', { params });
    return response.data;
  },

  // Mark NFT as purchased (after blockchain transaction)
  markPurchased: async (data) => {
    const response = await api.post('/api/nfts/mark-purchased', data);
    return response.data;
  },

  // Get PR job status
  getPRJobStatus: async () => {
    const response = await api.get('/api/nfts/pr-job/status');
    return response.data;
  },

  // Manually trigger PR finalization
  triggerPRJob: async () => {
    const response = await api.post('/api/nfts/pr-job/trigger');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    console.log('🔄 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('💥 API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('❌ Final Error Message:', message);
    throw new Error(message);
  }
);

export default api; 