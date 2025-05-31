import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { buyNFT, listNFTForSale, delistNFTFromSale, listNFTForRent } from '../utils/wallet';
import { nftAPI } from '../utils/api';
import { formatETH } from '../utils/formatETH';
import { getIPFSUrl } from '../utils/ipfsUpload';
import { ShoppingCart, Clock, Home, User, Loader2, Tag, Heart, HeartCrack, Settings } from 'lucide-react';
import PRTimer from './PRTimer';
import LikeDislike from './LikeDislike';
import toast from 'react-hot-toast';

const NFTCard = ({ nft, onUpdate, showManageOptions = false }) => {
  const { account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState('');

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
      // Call smart contract to buy NFT
      const result = await buyNFT(nft.tokenId, nft.basePrice);
      
      if (result.success) {
        // Mark as purchased in the backend
        await nftAPI.markPurchased({
          tokenId: nft.tokenId,
          buyerAddress: account,
          transactionHash: result.transactionHash,
        });
        
        toast.success('NFT purchased successfully! 🎉');
        
        if (onUpdate) {
          onUpdate();
        }
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
      // Call smart contract to list for sale
      const result = await listNFTForSale(nft.tokenId);
      
      if (result.success) {
        // Update backend - ensure we pass the required fields
        await nftAPI.listForSale({
          tokenId: nft.tokenId,
          owner: account, // Required by validation schema
          basePrice: nft.basePrice // Include current base price
        });
        
        toast.success('NFT listed for sale successfully!');
        
        if (onUpdate) {
          onUpdate();
        }
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
      // Call smart contract to delist from sale
      const result = await delistNFTFromSale(nft.tokenId);
      
      if (result.success) {
        // Update backend - ensure we pass the required fields
        await nftAPI.delistFromSale({
          tokenId: nft.tokenId,
          owner: account // Required by validation schema
        });
        
        toast.success('NFT delisted from sale successfully!');
        
        if (onUpdate) {
          onUpdate();
        }
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
    if (onUpdate) {
      onUpdate();
    }
  };

  const getBadges = () => {
    const badges = [];
    
    if (nft.isPR) {
      badges.push(
        <span key="pr" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Price Reactive
        </span>
      );
    }
    
    if (nft.isForSale && !nft.isPR) {
      badges.push(
        <span key="sale" className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          For Sale
        </span>
      );
    }
    
    if (nft.isForRent) {
      badges.push(
        <span key="rent" className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          For Rent
        </span>
      );
    }
    
    if (nft.renter) {
      badges.push(
        <span key="rented" className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Rented
        </span>
      );
    }
    
    return badges;
  };

  const calculateFinalPrice = () => {
    if (!nft.isPR) return nft.basePrice;
    
    const priceAdjustment = (nft.likes - nft.dislikes) * 0.0001;
    return Math.max(nft.basePrice, nft.basePrice + priceAdjustment);
  };

  const getImageUrl = () => {
    // If imageURL already contains full URL, use it directly
    if (nft.imageURL && (nft.imageURL.startsWith('http://') || nft.imageURL.startsWith('https://'))) {
      return nft.imageURL;
    }
    
    // Convert IPFS hash to full URL
    const ipfsUrl = getIPFSUrl(nft.imageURL);
    return ipfsUrl || `https://via.placeholder.com/400x300?text=NFT+${nft.tokenId}`;
  };

  const isOwner = account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Image */}
      <div className="relative">
        <Link to={`/nft/${nft.tokenId}`}>
          <img
            src={getImageUrl()}
            alt={nft.name}
            className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.log('Image load error for NFT', nft.tokenId, 'URL:', e.target.src);
              e.target.src = `https://via.placeholder.com/400x300/f0f0f0/333333?text=NFT+${nft.tokenId}`;
            }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {getBadges()}
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-3 right-3">
            <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full font-medium">
              You own this
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Token ID */}
        <div className="mb-2">
          <Link 
            to={`/nft/${nft.tokenId}`}
            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {nft.name}
          </Link>
          <p className="text-sm text-gray-500">Token ID: #{nft.tokenId}</p>
        </div>

        {/* Description */}
        {nft.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {nft.description}
          </p>
        )}

        {/* Owner */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <User size={14} />
          <span>
            {isOwner 
              ? 'You' 
              : `${nft.owner?.slice(0, 6)}...${nft.owner?.slice(-4)}`
            }
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">Price</div>
              <div className="font-bold text-lg text-gray-900">
                {formatETH(calculateFinalPrice())} MON
              </div>
            </div>
          </div>
        </div>

        {/* PR Timer */}
        {nft.isPR && nft.prEndTime && (
          <div className="mb-3">
            <PRTimer 
              endTime={nft.prEndTime} 
              onExpired={handlePRExpired}
            />
          </div>
        )}

        {/* Like/Dislike for PR NFTs */}
        {nft.isPR && (
          <div className="mb-3">
            <LikeDislike
              tokenId={nft.tokenId}
              initialLikes={nft.likes || 0}
              initialDislikes={nft.dislikes || 0}
              onUpdate={onUpdate}
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Owner Management Options */}
          {isOwner && showManageOptions && (
            <div className="flex gap-2">
              {!nft.isForSale ? (
                <button
                  onClick={handleListForSale}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {isLoading && actionType === 'listing' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Tag size={14} />
                  )}
                  List for Sale
                </button>
              ) : (
                <button
                  onClick={handleDelistFromSale}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {isLoading && actionType === 'delisting' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Tag size={14} />
                  )}
                  Delist
                </button>
              )}
            </div>
          )}

          {/* Buy Button - Only for non-PR NFTs that are for sale and not owned by user */}
          {!nft.isPR && nft.isForSale && !isOwner && (
            <button
              onClick={handleBuyNFT}
              disabled={isLoading || !isConnected}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading && actionType === 'buying' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingCart size={16} />
              )}
              <span>{isLoading && actionType === 'buying' ? 'Buying...' : 'Buy Now'}</span>
            </button>
          )}

          {/* View Details Button */}
          <Link
            to={`/nft/${nft.tokenId}`}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            View Details
          </Link>
        </div>

        {/* Connect Wallet Message */}
        {!isConnected && !nft.isPR && nft.isForSale && !isOwner && (
          <div className="mt-2 text-sm text-gray-500 text-center">
            Connect wallet to purchase
          </div>
        )}

        {/* PR NFT Message */}
        {nft.isPR && !isOwner && (
          <div className="mt-2 text-sm text-purple-600 text-center font-medium">
            Vote to influence the final price!
          </div>
        )}

        {/* Owner Message */}
        {isOwner && !showManageOptions && (
          <div className="mt-2 text-sm text-green-600 text-center font-medium">
            You own this NFT
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard; 