import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { nftAPI } from '../utils/api';
import NFTCard from '../components/NFTCard';
import { Search, Filter, TrendingUp, Loader2, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const { isConnected } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Refs to prevent rapid successive calls
  const lastFetchTime = useRef(0);
  const lastStatsTime = useRef(0);
  const lastUpdateCall = useRef(0); // Add ref to track update calls
  const fetchNFTsRef = useRef(); // Store latest fetchNFTs
  const fetchStatsRef = useRef(); // Store latest fetchStats
  
  const filters = [
    { key: 'all', label: 'All NFTs', icon: '🎨' },
    { key: 'for_sale', label: 'For Sale', icon: '💰' },
    { key: 'for_rent', label: 'For Rent', icon: '🏠' },
    { key: 'pr', label: 'Price Reactive', icon: '📊' },
    { key: 'rented', label: 'Rented', icon: '🔒' }
  ];

  const sortOptions = [
    { key: 'newest', label: 'Newest First' },
    { key: 'oldest', label: 'Oldest First' },
    { key: 'price_low', label: 'Price: Low to High' },
    { key: 'price_high', label: 'Price: High to Low' },
    { key: 'name_asc', label: 'Name: A to Z' },
    { key: 'name_desc', label: 'Name: Z to A' }
  ];

  const fetchNFTs = useCallback(async (force = false) => {
    const now = Date.now();
    // Only prevent rapid calls, not initial load
    if (!force && now - lastFetchTime.current < 2000) {
      console.log('⏰ Skipping NFT fetch - too soon after last call');
      return;
    }
    lastFetchTime.current = now;

    try {
      setLoading(true);
      console.log('🔄 Fetching NFTs from API...');
      
      const response = await nftAPI.getAllNFTs({
        page: 1,
        limit: 50,
        sortBy: 'mintedAt',
        sortOrder: 'desc'
      });
      
      console.log('✅ Raw API Response:', response);
      console.log('📦 NFTs Data:', response.data);
      console.log('🔢 NFTs Count:', response.data?.nfts?.length || 0);
      
      if (response.success && response.data?.nfts) {
        setNfts(response.data.nfts);
        console.log('✅ NFTs set successfully:', response.data.nfts.length, 'items');
      } else {
        console.warn('⚠️ Invalid response structure:', response);
        setNfts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching NFTs:');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast.error(`Failed to fetch NFTs: ${error.message}`);
      setNfts([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('🏁 NFT fetch completed, loading set to false');
    }
  }, []);

  const fetchStats = useCallback(async (force = false) => {
    const now = Date.now();
    // Debounce stats calls more aggressively - minimum 5 seconds between calls
    if (!force && now - lastStatsTime.current < 5000) {
      console.log('⏰ Skipping stats fetch - too soon after last call');
      return;
    }
    lastStatsTime.current = now;

    try {
      console.log('📊 Fetching stats...');
      const response = await nftAPI.getStats();
      console.log('✅ Stats Response:', response);
      setStats(response.data || response.stats);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Don't show toast for stats errors to avoid spam
    }
  }, []);

  // Store latest function references
  fetchNFTsRef.current = fetchNFTs;
  fetchStatsRef.current = fetchStats;

  // Initial fetch - run immediately on mount
  useEffect(() => {
    console.log('🚀 Home component mounted, starting initial fetch...');
    console.log('🔗 API Base URL:', 'http://localhost:5000');
    
    // Test API connectivity first
    const testAPI = async () => {
      try {
        console.log('🩺 Testing API connectivity...');
        const healthResponse = await fetch('http://localhost:5000/health');
        console.log('💗 Health check response:', healthResponse.status);
        
        if (healthResponse.ok) {
          console.log('✅ Backend is responding, proceeding with data fetch');
          await fetchNFTs(true); // Force initial fetch
          await fetchStats(true); // Force initial stats
        } else {
          console.error('❌ Backend health check failed');
          toast.error('Backend server is not responding');
        }
      } catch (error) {
        console.error('💥 Backend connectivity error:', error);
        toast.error('Cannot connect to backend server. Please ensure it is running.');
      }
    };
    
    testAPI();
  }, []); // Empty dependency array - only run once on mount

  // Filter and sort when dependencies change
  useEffect(() => {
    filterAndSortNFTs();
  }, [nfts, searchTerm, activeFilter, sortBy]);

  // Listen for NFT minting events
  useEffect(() => {
    const handleNFTMinted = (event) => {
      console.log('🔔 NFT minted event:', event.detail);
      fetchNFTs(true); // Force refresh on mint
      fetchStats(true); // Force stats refresh on mint
    };

    window.addEventListener('nftMinted', handleNFTMinted);
    
    return () => {
      window.removeEventListener('nftMinted', handleNFTMinted);
    };
  }, []); // Empty dependency array to prevent recreating the listener

  const filterAndSortNFTs = () => {
    let filtered = [...nfts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tokenId.toString().includes(searchTerm)
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'for_sale':
        filtered = filtered.filter(nft => nft.isForSale && !nft.isPR);
        break;
      case 'for_rent':
        filtered = filtered.filter(nft => nft.isForRent);
        break;
      case 'pr':
        filtered = filtered.filter(nft => nft.isPR);
        break;
      case 'rented':
        filtered = filtered.filter(nft => nft.renter);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.mintedAt) - new Date(b.mintedAt));
        break;
      case 'price_low':
        filtered.sort((a, b) => parseFloat(a.basePrice) - parseFloat(b.basePrice));
        break;
      case 'price_high':
        filtered.sort((a, b) => parseFloat(b.basePrice) - parseFloat(a.basePrice));
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // 'newest'
        filtered.sort((a, b) => new Date(b.mintedAt) - new Date(a.mintedAt));
        break;
    }

    setFilteredNfts(filtered);
  };

  const handleNFTUpdate = useCallback(() => {
    const now = Date.now();
    // Debounce update calls - minimum 3 seconds between calls
    if (now - lastUpdateCall.current < 3000) {
      console.log('⏰ Skipping NFT update - too soon after last call');
      return;
    }
    lastUpdateCall.current = now;
    
    console.log('🔄 Handle NFT Update called');
    fetchNFTsRef.current(); // Use ref to get latest function
    // Only fetch stats occasionally, not on every update
    if (Date.now() - lastStatsTime.current > 10000) { // Only if stats are older than 10 seconds
      fetchStatsRef.current();
    }
  }, []); // Remove dependencies to prevent recreation

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Monad NFT Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover, trade, and create unique digital assets on the Monad blockchain. 
            Experience Price Reactive NFTs where community votes influence prices.
          </p>
          
          {/* Network Status */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">Connected to Monad Testnet</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mint"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Mint NFT
            </Link>
            
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchNFTs(true); // Force refresh
                fetchStats(true); // Force stats refresh
                toast.success('NFT list refreshed!');
              }}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <TrendingUp size={20} />
              Refresh NFTs
            </button>
            
            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
                <p className="text-yellow-800">
                  <span className="font-medium">Connect your wallet</span> to start minting and trading NFTs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{stats.totalNFTs || 0}</div>
              <div className="text-sm text-gray-600">Total NFTs</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.forSale || 0}</div>
              <div className="text-sm text-gray-600">For Sale</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{stats.prNFTs || 0}</div>
              <div className="text-sm text-gray-600">Price Reactive</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.rented || 0}</div>
              <div className="text-sm text-gray-600">Rented</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search NFTs by name, description, or token ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="min-w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading ? (
              <span>Loading NFTs...</span>
            ) : (
              <span>
                Showing {filteredNfts.length} of {nfts.length} NFTs
                {activeFilter !== 'all' && ` in "${filters.find(f => f.key === activeFilter)?.label}"`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            )}
          </div>
        </div>

        {/* Smart Contract Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-900">Smart Contract Integration</h4>
              <p className="text-sm text-blue-700 mt-1">
                All minting, buying, and listing operations interact with the NFT Marketplace smart contract deployed at{' '}
                <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">0x6919B2303c62e822Ad9191B2D70F8D5e9fd10B55</code>
                {' '}on Monad Testnet.
              </p>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="text-gray-600">Loading NFTs...</span>
            <div className="mt-2 text-sm text-gray-500">
              Please ensure the backend server is running on port 5000
            </div>
          </div>
        ) : filteredNfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {nfts.length === 0 
                ? 'No NFTs minted yet' 
                : searchTerm || activeFilter !== 'all'
                  ? 'No NFTs match your filters'
                  : 'No NFTs found'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {nfts.length === 0 
                ? 'Be the first to mint an NFT on our marketplace!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {nfts.length === 0 && (
              <Link
                to="/mint"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Mint First NFT
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onUpdate={handleNFTUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 