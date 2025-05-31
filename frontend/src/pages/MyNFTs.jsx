import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { nftAPI } from '../utils/api';
import NFTCard from '../components/NFTCard';
import { Loader2, User, Package, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const MyNFTs = () => {
  const { account, isConnected } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    forSale: 0,
    forRent: 0,
    rented: 0
  });

  useEffect(() => {
    if (isConnected && account) {
      fetchMyNFTs();
    }
  }, [isConnected, account]);

  const fetchMyNFTs = async () => {
    try {
      setLoading(true);
      const response = await nftAPI.getAllNFTs({ owner: account });
      const myNFTs = response.nfts || [];
      setNfts(myNFTs);
      
      // Calculate stats
      const statsData = {
        total: myNFTs.length,
        forSale: myNFTs.filter(nft => nft.isForSale && !nft.isPR).length,
        forRent: myNFTs.filter(nft => nft.isForRent).length,
        rented: myNFTs.filter(nft => nft.renter).length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching my NFTs:', error);
      toast.error('Failed to fetch your NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleNFTUpdate = () => {
    fetchMyNFTs();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your NFTs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User size={24} className="text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">My NFTs</h1>
          </div>
          <p className="text-gray-600">
            Manage your digital assets and listings
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total NFTs</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{stats.forSale}</div>
              <div className="text-sm text-gray-600">Listed for Sale</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{stats.forRent}</div>
              <div className="text-sm text-gray-600">Listed for Rent</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-orange-600">{stats.rented}</div>
              <div className="text-sm text-gray-600">Currently Rented</div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-2 text-gray-600">Loading your NFTs...</span>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
            <p className="text-gray-600 mb-6">
              You don't own any NFTs yet. Start by minting your first NFT!
            </p>
            <a
              href="/mint"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mint Your First NFT
            </a>
          </div>
        ) : (
          <>
            {/* Management Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Settings className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900">NFT Management</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Use the buttons on each NFT card to list/delist for sale. All transactions require confirmation in MetaMask and will interact with the Monad blockchain.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <NFTCard
                  key={nft.tokenId}
                  nft={nft}
                  onUpdate={handleNFTUpdate}
                  showManageOptions={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyNFTs; 