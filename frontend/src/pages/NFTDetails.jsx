import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { nftAPI } from '../utils/api';
import { buyNFT, listNFTForSale, delistNFTFromSale, getNFTDetailsFromContract } from '../utils/wallet';
import { formatETH } from '../utils/formatETH';
import { getIPFSUrl } from '../utils/ipfsUpload';
import { 
  ShoppingCart, 
  ArrowLeft, 
  User, 
  Tag, 
  Calendar, 
  Hash, 
  ExternalLink,
  Loader2,
  Settings,
  Share2,
  Copy,
  CheckCircle
} from 'lucide-react';
import PRTimer from '../components/PRTimer';
import LikeDislike from '../components/LikeDislike';
import toast from 'react-hot-toast';

const NFTDetails = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState('');
  const [copied, setCopied] = useState(false);
  const [syncingWithContract, setSyncingWithContract] = useState(false);

  useEffect(() => {
    if (tokenId) {
      fetchNFTDetails();
    }
  }, [tokenId]);

  const fetchNFTDetails = async () => {
    try {
      setLoading(true);
      const response = await nftAPI.getNFTById(tokenId);
      console.log('NFT Details API Response:', response);
      setNft(response.data || response.nft || response);
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      toast.error('Failed to fetch NFT details');
    } finally {
      setLoading(false);
    }
  };

  const syncWithContract = async () => {
    if (!isConnected || !tokenId) return;
    
    try {
      setSyncingWithContract(true);
      const contractDetails = await getNFTDetailsFromContract(tokenId);
      
      // Update local state with contract data
      setNft(prev => ({
        ...prev,
        isForSale: contractDetails.isListedForSale,
        isForRent: contractDetails.isListedForRent,
        owner: contractDetails.owner,
        basePrice: parseFloat(contractDetails.basePrice),
      }));
      
      toast.success('Synced with blockchain');
    } catch (error) {
      console.error('Error syncing with contract:', error);
      toast.error('Failed to sync with blockchain');
    } finally {
      setSyncingWithContract(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (nft.isPR) {
      toast.error('PR NFTs cannot be purchased directly');
      return;
    }

    setIsLoading(true);
    setActionType('buying');
    try {
      const result = await buyNFT(nft.tokenId, nft.basePrice);
      
      if (result.success) {
        await nftAPI.markPurchased({
          tokenId: nft.tokenId,
          buyerAddress: account,
          transactionHash: result.transactionHash,
        });
        
        toast.success('NFT purchased successfully! 🎉');
        
        // Refresh NFT details
        await fetchNFTDetails();
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error(error.message || 'Failed to buy NFT');
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  const handleListForSale = async () => {
    setIsLoading(true);
    setActionType('listing');
    try {
      const result = await listNFTForSale(nft.tokenId);
      
      if (result.success) {
        await nftAPI.listForSale({
          tokenId: nft.tokenId,
          owner: account,
          basePrice: nft.basePrice
        });
        
        toast.success('NFT listed for sale successfully!');
        await fetchNFTDetails();
      }
    } catch (error) {
      console.error('Error listing NFT for sale:', error);
      toast.error(error.message || 'Failed to list NFT for sale');
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  const handleDelistFromSale = async () => {
    setIsLoading(true);
    setActionType('delisting');
    try {
      const result = await delistNFTFromSale(nft.tokenId);
      
      if (result.success) {
        await nftAPI.delistFromSale({
          tokenId: nft.tokenId,
          owner: account
        });
        
        toast.success('NFT delisted from sale successfully!');
        await fetchNFTDetails();
      }
    } catch (error) {
      console.error('Error delisting NFT from sale:', error);
      toast.error(error.message || 'Failed to delist NFT from sale');
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  const handlePRExpired = () => {
    fetchNFTDetails();
  };

  const handleLikeDislikeUpdate = () => {
    fetchNFTDetails();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const shareNFT = () => {
    const url = window.location.href;
    copyToClipboard(url);
  };

  const getImageUrl = () => {
    // Debug logging
    console.log('NFT Details Image Debug:', {
      tokenId: nft.tokenId,
      imageURL: nft.imageURL,
      convertedUrl: getIPFSUrl(nft.imageURL)
    });
    
    // If imageURL already contains full URL, use it directly
    if (nft.imageURL && nft.imageURL.startsWith('http')) {
      return nft.imageURL;
    }
    
    // Convert IPFS hash to full URL
    const ipfsUrl = getIPFSUrl(nft.imageURL);
    return ipfsUrl || `https://via.placeholder.com/600x600/f0f0f0/333333?text=NFT+${nft.tokenId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-lg text-gray-600">Loading NFT details...</span>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">NFT not found</h2>
          <p className="text-gray-600 mb-4">The NFT you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go back to marketplace
          </button>
        </div>
      </div>
    );
  }

  const calculateFinalPrice = () => {
    if (!nft.isPR) return nft.basePrice;
    
    const priceAdjustment = (nft.likes - nft.dislikes) * 0.0001;
    return Math.max(nft.basePrice, nft.basePrice + priceAdjustment);
  };

  const isOwner = account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={getImageUrl()}
                alt={nft.name}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  console.log('NFT Details image load error for NFT', nft.tokenId, 'URL:', e.target.src);
                  e.target.src = `https://via.placeholder.com/600x600/f0f0f0/333333?text=NFT+${nft.tokenId}`;
                }}
              />
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {nft.isPR && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Price Reactive
                  </span>
                )}
                {nft.isForSale && !nft.isPR && (
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    For Sale
                  </span>
                )}
                {nft.isForRent && (
                  <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    For Rent
                  </span>
                )}
                {nft.renter && (
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    Rented
                  </span>
                )}
              </div>

              {/* Owner Badge */}
              {isOwner && (
                <div className="absolute top-4 right-4">
                  <span className="bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded-full font-medium">
                    You own this
                  </span>
                </div>
              )}
            </div>

            {/* Sync with Contract Button */}
            {isConnected && (
              <button
                onClick={syncWithContract}
                disabled={syncingWithContract}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {syncingWithContract ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Settings size={16} />
                )}
                {syncingWithContract ? 'Syncing...' : 'Sync with Blockchain'}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{nft.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash size={16} />
                  <span>Token ID: {nft.tokenId}</span>
                </div>
              </div>
              
              <button
                onClick={shareNFT}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2"
              >
                {copied ? <CheckCircle size={16} /> : <Share2 size={16} />}
                Share
              </button>
            </div>

            {/* Description */}
            {nft.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{nft.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="font-medium text-gray-900">
                    {isOwner ? (
                      'You'
                    ) : (
                      <button
                        onClick={() => copyToClipboard(nft.owner)}
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        {`${nft.owner?.slice(0, 8)}...${nft.owner?.slice(-6)}`}
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <Tag size={20} className="text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatETH(calculateFinalPrice())} MON
                  </div>
                  {nft.isPR && (
                    <div className="text-sm text-gray-500 mt-1">
                      Base: {formatETH(nft.basePrice)} MON
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PR Timer */}
            {nft.isPR && nft.prEndTime && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Price Reactive Period</h3>
                <PRTimer 
                  endTime={nft.prEndTime} 
                  onExpired={handlePRExpired}
                />
              </div>
            )}

            {/* Like/Dislike for PR NFTs */}
            {nft.isPR && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Community Voting</h3>
                <LikeDislike
                  tokenId={nft.tokenId}
                  initialLikes={nft.likes || 0}
                  initialDislikes={nft.dislikes || 0}
                  onUpdate={handleLikeDislikeUpdate}
                />
                <p className="text-sm text-purple-700 mt-2">
                  Each like increases price by 0.0001 MON, each dislike decreases it
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Owner Management */}
              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Manage Your NFT</h3>
                  <div className="space-y-2">
                    {!nft.isForSale ? (
                      <button
                        onClick={handleListForSale}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        {isLoading && actionType === 'listing' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Tag size={16} />
                        )}
                        List for Sale
                      </button>
                    ) : (
                      <button
                        onClick={handleDelistFromSale}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        {isLoading && actionType === 'delisting' ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Tag size={16} />
                        )}
                        Delist from Sale
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Buy Button */}
              {!nft.isPR && nft.isForSale && !isOwner && (
                <button
                  onClick={handleBuyNFT}
                  disabled={isLoading || !isConnected}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
                >
                  {isLoading && actionType === 'buying' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={20} />
                  )}
                  <span>
                    {isLoading && actionType === 'buying' 
                      ? 'Buying...' 
                      : `Buy for ${formatETH(nft.basePrice)} MON`
                    }
                  </span>
                </button>
              )}

              {/* Connect Wallet Message */}
              {!isConnected && !nft.isPR && nft.isForSale && !isOwner && (
                <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700">Connect your wallet to purchase this NFT</p>
                </div>
              )}

              {/* PR NFT Message */}
              {nft.isPR && !isOwner && (
                <div className="text-center py-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-700 font-medium">
                    This is a Price Reactive NFT. Vote to influence the final price!
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Info */}
            {nft.transactionHash && (
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2">Blockchain Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Transaction Hash:</span>
                    <button
                      onClick={() => copyToClipboard(nft.transactionHash)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {`${nft.transactionHash.slice(0, 8)}...${nft.transactionHash.slice(-6)}`}
                      <Copy size={12} />
                    </button>
                  </div>
                  {nft.blockNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Block Number:</span>
                      <span className="text-gray-900">{nft.blockNumber}</span>
                    </div>
                  )}
                  <a
                    href={`https://testnet-explorer.monad.xyz/tx/${nft.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    View on Monad Explorer
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetails; 