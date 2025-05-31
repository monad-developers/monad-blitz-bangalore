import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { uploadToIPFS, validateImageFile } from '../utils/ipfsUpload';
import { mintNFT } from '../utils/wallet';
import { nftAPI } from '../utils/api';
import { Upload, Loader2, ImageIcon, Calendar, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const MintNFT = () => {
  const { account, isConnected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    isForSale: true, // Default to true since smart contract auto-lists
    isForRent: false,
    rentalFee: '',
    rentalDuration: 24,
    isPR: false,
    prDurationHours: 24,
    customPRDuration: '', // For custom duration input
    prDurationType: 'preset' // 'preset' or 'custom'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter NFT name');
      return;
    }

    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }

    // Allow very small values (down to 0.0000001)
    const basePriceNum = parseFloat(formData.basePrice);
    if (isNaN(basePriceNum) || basePriceNum < 0.0000001) {
      toast.error('Base price must be at least 0.0000001 MON');
      return;
    }

    if (formData.isForRent && (!formData.rentalFee || parseFloat(formData.rentalFee) <= 0)) {
      toast.error('Please enter a valid rental fee');
      return;
    }

    // Validate PR duration
    if (formData.isPR && formData.prDurationType === 'custom') {
      const customDuration = parseFloat(formData.customPRDuration);
      if (isNaN(customDuration) || customDuration < 60) {
        toast.error('Custom PR duration must be at least 60 seconds');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload to IPFS
      setUploadProgress(20);
      toast.loading('Uploading to IPFS...', { id: 'minting' });
      
      const metadata = {
        name: formData.name,
        description: formData.description,
      };

      const uploadResult = await uploadToIPFS(imageFile, metadata);
      setUploadProgress(40);

      // Step 2: Mint NFT on blockchain
      toast.loading('Minting NFT on blockchain...', { id: 'minting' });
      
      const mintResult = await mintNFT(
        account,
        uploadResult.data.metadataUrl,
        formData.basePrice
      );
      
      setUploadProgress(70);

      if (!mintResult.success || !mintResult.tokenId) {
        throw new Error('Failed to get token ID from blockchain transaction');
      }

      // Step 3: Save to database with blockchain token ID
      toast.loading('Saving to database...', { id: 'minting' });
      
      const dbData = {
        tokenId: parseInt(mintResult.tokenId),
        owner: account,
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        metadataURI: uploadResult.data.metadataUrl,
        imageURL: uploadResult.data.imageUrl,
        isForSale: true, // Always true since smart contract auto-lists
        isForRent: formData.isForRent,
        isPR: formData.isPR,
        transactionHash: mintResult.transactionHash,
        blockNumber: mintResult.blockNumber,
      };

      // Add rental data if applicable
      if (formData.isForRent) {
        dbData.rentalFee = parseFloat(formData.rentalFee);
        dbData.rentalDuration = parseInt(formData.rentalDuration);
      }

      // Add PR data if applicable
      if (formData.isPR) {
        let durationInHours;
        if (formData.prDurationType === 'custom') {
          // Convert seconds to hours for database
          durationInHours = parseFloat(formData.customPRDuration) / 3600;
        } else {
          durationInHours = parseInt(formData.prDurationHours);
        }
        dbData.prDurationHours = durationInHours;
      }

      await nftAPI.mintNFT(dbData);
      setUploadProgress(100);

      // Step 4: Additional contract calls if needed
      if (formData.isForRent || formData.isPR) {
        toast.loading('Setting up additional features...', { id: 'minting' });
        
        try {
          // Call listForRent on contract if rent is enabled
          if (formData.isForRent) {
            console.log('📝 Listing NFT for rent on contract...');
            console.log('Rent Details:', {
              tokenId: mintResult.tokenId,
              rentalFee: formData.rentalFee,
              rentalDuration: formData.rentalDuration
            });
            
            const { listNFTForRent } = await import('../utils/wallet');
            await listNFTForRent(
              parseInt(mintResult.tokenId),
              formData.rentalFee
            );
            console.log('✅ NFT listed for rent on contract');
          }

          // Call lockNFT on contract if PR is enabled
          if (formData.isPR) {
            console.log('📝 Locking NFT for PR on contract...');
            console.log('PR Duration Debug:', {
              prDurationType: formData.prDurationType,
              prDurationHours: formData.prDurationHours,
              customPRDuration: formData.customPRDuration
            });
            
            const { lockNFT } = await import('../utils/wallet');
            
            let durationInDays;
            if (formData.prDurationType === 'custom') {
              // Convert seconds to days
              durationInDays = Math.ceil(parseFloat(formData.customPRDuration) / (24 * 60 * 60));
              console.log('🔧 Custom duration calculation:', {
                seconds: formData.customPRDuration,
                days: durationInDays
              });
            } else {
              // Convert hours to days
              durationInDays = Math.ceil(parseInt(formData.prDurationHours) / 24);
              console.log('🔧 Preset duration calculation:', {
                hours: formData.prDurationHours,
                days: durationInDays
              });
            }
            
            // Ensure minimum 1 day
            durationInDays = Math.max(1, durationInDays);
            console.log('🔒 Final duration for lockNFT:', durationInDays, 'days');
            
            await lockNFT(
              parseInt(mintResult.tokenId),
              durationInDays
            );
            console.log('✅ NFT locked for PR on contract');
          }
        } catch (contractError) {
          console.warn('⚠️ Additional contract calls failed:', contractError);
          // Don't fail the entire process if these fail
          toast.loading('NFT minted successfully, setting up features...', { id: 'minting' });
        }
      }

      toast.success('NFT minted successfully! 🎉', { id: 'minting' });
      
      // Refresh the NFT list to show the new NFT
      window.dispatchEvent(new CustomEvent('nftMinted', { 
        detail: { tokenId: mintResult.tokenId } 
      }));
      
      // Navigate to the newly minted NFT
      setTimeout(() => {
        navigate(`/nft/${mintResult.tokenId}`);
      }, 1000);

    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(error.message || 'Failed to mint NFT', { id: 'minting' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      isForSale: true,
      isForRent: false,
      rentalFee: '',
      rentalDuration: 24,
      isPR: false,
      prDurationHours: 24,
      customPRDuration: '',
      prDurationType: 'preset'
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to mint NFTs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mint New NFT</h1>
          <p className="text-gray-600">Create and mint your unique digital asset on Monad Testnet</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload an image
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 50MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* NFT Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter NFT name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your NFT"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (MON) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      placeholder="0.0000001"
                      step="0.0000001"
                      min="0.0000001"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum: 0.0000001 MON. Your NFT will be automatically listed for sale at this price.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* For Rent */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isForRent"
                      checked={formData.isForRent}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Also list for rent
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Allow others to rent this NFT temporarily
                  </p>
                  
                  {formData.isForRent && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="number"
                        name="rentalFee"
                        value={formData.rentalFee}
                        onChange={handleInputChange}
                        placeholder="Rental fee per day (MON)"
                        step="0.0000001"
                        min="0.0000001"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        required={formData.isForRent}
                      />
                      <select
                        name="rentalDuration"
                        value={formData.rentalDuration}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value={24}>24 hours</option>
                        <option value={48}>48 hours</option>
                        <option value={72}>72 hours</option>
                        <option value={168}>1 week</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Price Reactive */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPR"
                      checked={formData.isPR}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Price Reactive
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Let the community vote to influence the final price
                  </p>
                  
                  {formData.isPR && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Duration Type
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="prDurationType"
                              value="preset"
                              checked={formData.prDurationType === 'preset'}
                              onChange={handleInputChange}
                              className="mr-1"
                            />
                            <span className="text-xs">Preset</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="prDurationType"
                              value="custom"
                              checked={formData.prDurationType === 'custom'}
                              onChange={handleInputChange}
                              className="mr-1"
                            />
                            <span className="text-xs">Custom (seconds)</span>
                          </label>
                        </div>
                      </div>
                      
                      {formData.prDurationType === 'preset' ? (
                        <select
                          name="prDurationHours"
                          value={formData.prDurationHours}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value={24}>24 hours</option>
                          <option value={48}>48 hours</option>
                          <option value={72}>72 hours</option>
                          <option value={168}>1 week</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="number"
                            name="customPRDuration"
                            value={formData.customPRDuration}
                            onChange={handleInputChange}
                            placeholder="Duration in seconds (min: 60)"
                            min="60"
                            step="1"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            required={formData.isPR && formData.prDurationType === 'custom'}
                          />
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Quick presets:</div>
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, customPRDuration: '3600'}))}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              >
                                1h (3600s)
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, customPRDuration: '86400'}))}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              >
                                1d (86400s)
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, customPRDuration: '604800'}))}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                              >
                                1w (604800s)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Important Notes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your NFT will be minted on Monad Testnet</li>
                <li>• The NFT will be automatically listed for sale at your base price</li>
                <li>• You'll need to pay gas fees for the minting transaction</li>
                <li>• Make sure you're connected to Monad Testnet in MetaMask</li>
              </ul>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    Minting NFT...
                  </span>
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  {uploadProgress < 40 && 'Uploading to IPFS...'}
                  {uploadProgress >= 40 && uploadProgress < 70 && 'Minting on blockchain...'}
                  {uploadProgress >= 70 && uploadProgress < 100 && 'Saving to database...'}
                  {uploadProgress === 100 && 'Complete!'}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                disabled={isUploading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>
              
              <button
                type="submit"
                disabled={isUploading || !imageFile || !formData.name || !formData.basePrice}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-medium transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Mint NFT
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MintNFT; 