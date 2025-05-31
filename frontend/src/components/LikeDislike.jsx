import React, { useState, useEffect } from 'react';
import { Heart, HeartCrack, Loader2 } from 'lucide-react';
import { nftAPI } from '../utils/api';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

const LikeDislike = ({ tokenId, initialLikes = 0, initialDislikes = 0, onUpdate }) => {
  const { account, isConnected } = useWallet();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userAction, setUserAction] = useState(null); // 'like', 'dislike', or null
  const [isLoading, setIsLoading] = useState(false);

  // Update likes and dislikes when props change
  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [initialLikes, initialDislikes]);

  // Check if user has already voted (stored in localStorage)
  useEffect(() => {
    if (account) {
      const storageKey = `nft_${tokenId}_vote_${account}`;
      const storedAction = localStorage.getItem(storageKey);
      setUserAction(storedAction);
    }
  }, [tokenId, account]);

  const handleLike = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userAction === 'like') {
      toast.error('You have already liked this NFT');
      return;
    }

    if (userAction === 'dislike') {
      toast.error('You have already disliked this NFT');
      return;
    }

    setIsLoading(true);
    try {
      console.log('👍 Attempting to like NFT:', tokenId);
      const response = await nftAPI.likeNFT(tokenId);
      console.log('👍 Like response:', response);
      
      // Update local state
      setLikes(prev => prev + 1);
      setUserAction('like');
      
      // Store in localStorage
      const storageKey = `nft_${tokenId}_vote_${account}`;
      localStorage.setItem(storageKey, 'like');
      
      toast.success('NFT liked! 💖');
      
      // Call the parent update function to refresh data (with longer timeout to prevent loops)
      if (onUpdate) {
        setTimeout(() => onUpdate(), 1000);
      }
    } catch (error) {
      console.error('Error liking NFT:', error);
      toast.error(error.message || 'Failed to like NFT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userAction === 'dislike') {
      toast.error('You have already disliked this NFT');
      return;
    }

    if (userAction === 'like') {
      toast.error('You have already liked this NFT');
      return;
    }

    setIsLoading(true);
    try {
      console.log('👎 Attempting to dislike NFT:', tokenId);
      const response = await nftAPI.dislikeNFT(tokenId);
      console.log('👎 Dislike response:', response);
      
      // Update local state
      setDislikes(prev => prev + 1);
      setUserAction('dislike');
      
      // Store in localStorage
      const storageKey = `nft_${tokenId}_vote_${account}`;
      localStorage.setItem(storageKey, 'dislike');
      
      toast.success('NFT disliked! 💔');
      
      // Call the parent update function to refresh data (with longer timeout to prevent loops)
      if (onUpdate) {
        setTimeout(() => onUpdate(), 1000);
      }
    } catch (error) {
      console.error('Error disliking NFT:', error);
      toast.error(error.message || 'Failed to dislike NFT');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={isLoading || !isConnected || userAction !== null}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            userAction === 'like'
              ? 'bg-red-500 text-white shadow-lg'
              : userAction !== null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-600 hover:bg-red-200 hover:shadow-md'
          }`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart 
              size={16} 
              className={userAction === 'like' ? 'fill-current' : ''} 
            />
          )}
          <span>{likes}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDislike}
          disabled={isLoading || !isConnected || userAction !== null}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            userAction === 'dislike'
              ? 'bg-gray-600 text-white shadow-lg'
              : userAction !== null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
          }`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <HeartCrack 
              size={16} 
              className={userAction === 'dislike' ? 'fill-current' : ''} 
            />
          )}
          <span>{dislikes}</span>
        </button>
      </div>

      {!isConnected && (
        <div className="text-sm text-gray-500">
          Connect wallet to vote
        </div>
      )}

      {userAction && (
        <div className="text-sm text-gray-500">
          You {userAction}d this NFT
        </div>
      )}
    </div>
  );
};

export default LikeDislike; 