import { ethers } from 'ethers';
import NFTMarketplaceABI from './NFTMarketplace.json';

// Monad Testnet configuration
const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 in hex (Monad Testnet chain ID)
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
};

const NFT_CONTRACT_ADDRESS = '0x6919B2303c62e822Ad9191B2D70F8D5e9fd10B55';

/**
 * Check if MetaMask is installed
 * @returns {boolean} Whether MetaMask is available
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
};

/**
 * Get current chain ID
 * @returns {Promise<string>} Current chain ID in hex
 */
export const getCurrentChainId = async () => {
  if (!isMetaMaskInstalled()) return null;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Check if we're on Monad Testnet
 * @returns {Promise<boolean>} Whether we're connected to Monad Testnet
 */
export const isOnMonadTestnet = async () => {
  const chainId = await getCurrentChainId();
  console.log('Current chain ID:', chainId, 'Expected:', MONAD_TESTNET.chainId);
  
  // Make comparison case-insensitive
  const currentChainId = chainId?.toLowerCase();
  const expectedChainId = MONAD_TESTNET.chainId.toLowerCase();
  
  return currentChainId === expectedChainId;
};

/**
 * Switch to Monad Testnet
 */
export const switchToMonadTestnet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    console.log('Attempting to switch to Monad Testnet...');
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_TESTNET.chainId }],
    });
    console.log('Successfully switched to Monad Testnet');
  } catch (switchError) {
    console.log('Switch error:', switchError);
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        console.log('Adding Monad Testnet to MetaMask...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [MONAD_TESTNET],
        });
        console.log('Successfully added Monad Testnet');
      } catch (addError) {
        console.error('Error adding Monad Testnet:', addError);
        throw new Error('Failed to add Monad Testnet to MetaMask');
      }
    } else {
      console.error('Error switching to Monad Testnet:', switchError);
      throw new Error('Failed to switch to Monad Testnet');
    }
  }
};

/**
 * Connect to MetaMask wallet - Simplified approach
 * @returns {Promise<string>} Connected wallet address
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    console.log('Starting simplified wallet connection...');
    
    // First, let's just try to get accounts without requesting
    let accounts = [];
    try {
      accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('Existing accounts:', accounts);
    } catch (error) {
      console.log('No existing accounts, will request connection');
    }

    // If no accounts, request connection
    if (accounts.length === 0) {
      console.log('Requesting account access...');
      try {
        accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        console.log('Accounts after request:', accounts);
      } catch (requestError) {
        console.error('Request accounts error:', requestError);
        if (requestError.code === 4001) {
          throw new Error('User rejected the connection request');
        } else if (requestError.code === -32002) {
          throw new Error('Connection request is already pending. Please check MetaMask.');
        }
        throw requestError;
      }
    }

    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask and try again.');
    }

    const account = accounts[0];
    console.log('Connected account:', account);

    // Check network after connection
    console.log('Checking network...');
    const isCorrectNetwork = await isOnMonadTestnet();
    
    if (!isCorrectNetwork) {
      console.log('Not on correct network, switching...');
      try {
        await switchToMonadTestnet();
        
        // Verify we're now on the correct network
        const isNowCorrect = await isOnMonadTestnet();
        if (!isNowCorrect) {
          throw new Error('Failed to switch to Monad Testnet');
        }
      } catch (networkError) {
        console.error('Network switch error:', networkError);
        // Don't fail the connection if network switch fails, just warn
        console.warn('Could not switch to Monad Testnet automatically. Please switch manually.');
      }
    }

    console.log('Wallet connection successful!');
    return account;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

/**
 * Get the current connected account - Simplified
 * @returns {Promise<string|null>} Current account address or null
 */
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Get provider and signer
 * @returns {Promise<{provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner}>}
 */
export const getProviderAndSigner = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    console.log('🔗 Creating provider and signer...');
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('✅ Provider created:', provider);
    
    const signer = await provider.getSigner();
    console.log('✅ Signer created:', {
      address: await signer.getAddress(),
      type: typeof signer
    });
    
    return { provider, signer };
  } catch (error) {
    console.error('❌ Error creating provider/signer:', error);
    throw new Error(`Failed to create provider/signer: ${error.message}`);
  }
};

/**
 * Get NFT Marketplace contract instance with signer
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export const getNFTMarketplaceContract = async () => {
  try {
    console.log('📄 Getting NFT Marketplace contract...');
    console.log('Contract address:', NFT_CONTRACT_ADDRESS);
    console.log('ABI import:', NFTMarketplaceABI);
    console.log('ABI available:', !!NFTMarketplaceABI?.abi);
    console.log('ABI length:', NFTMarketplaceABI?.abi?.length);
    
    // Check if ABI is properly structured
    if (!NFTMarketplaceABI || !NFTMarketplaceABI.abi) {
      throw new Error('ABI is not properly imported or structured');
    }
    
    const { signer } = await getProviderAndSigner();
    
    console.log('🔧 Creating contract instance...');
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFTMarketplaceABI.abi,
      signer
    );
    
    // Check contract interface before trying to access functions
    console.log('✅ Contract created:', {
      address: contract.target || contract.address,
      hasInterface: !!contract.interface,
      hasMintNFT: typeof contract.mintNFT === 'function'
    });
    
    // Only try to access functions if interface exists
    if (contract.interface && contract.interface.functions) {
      console.log('Available functions:', Object.keys(contract.interface.functions).slice(0, 5));
    } else {
      console.log('⚠️ Contract interface or functions not available');
    }
    
    return contract;
  } catch (error) {
    console.error('❌ Error creating contract:', error);
    throw new Error(`Failed to create contract: ${error.message}`);
  }
};

/**
 * Get NFT Marketplace contract instance with provider (read-only)
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export const getNFTMarketplaceContractReadOnly = async () => {
  const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
  
  return new ethers.Contract(
    NFT_CONTRACT_ADDRESS,
    NFTMarketplaceABI.abi,
    provider
  );
};

/**
 * Mint NFT on the blockchain
 * @param {string} to - Address to mint to
 * @param {string} tokenURI - IPFS URI for metadata
 * @param {string} basePrice - Base price in ETH
 * @returns {Promise<Object>} Transaction result
 */
export const mintNFT = async (to, tokenURI, basePrice) => {
  try {
    console.log('🎯 Starting NFT mint process...');
    console.log('Parameters:', { to, tokenURI, basePrice });
    
    // Verify wallet is connected and on correct network
    const account = await getCurrentAccount();
    if (!account) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    console.log('✅ Wallet connected:', account);
    
    const isCorrectNetwork = await isOnMonadTestnet();
    if (!isCorrectNetwork) {
      throw new Error('Please switch to Monad Testnet in MetaMask');
    }
    console.log('✅ On correct network');
    
    // Get contract instance
    console.log('📄 Getting contract instance...');
    const contract = await getNFTMarketplaceContract();
    
    if (!contract) {
      throw new Error('Failed to initialize contract');
    }
    console.log('✅ Contract initialized:', {
      address: contract.target || contract.address,
      hasFunction: typeof contract.mintNFT === 'function'
    });
    
    // Validate contract has mintNFT function
    if (typeof contract.mintNFT !== 'function') {
      throw new Error('Contract does not have mintNFT function');
    }
    
    // Convert price to Wei
    console.log('💰 Converting price to Wei...');
    const basePriceInWei = ethers.parseEther(basePrice.toString());
    console.log('Price in Wei:', basePriceInWei.toString());
    
    // Prepare transaction
    console.log('🔧 Preparing transaction...');
    console.log('Contract function exists:', !!contract.mintNFT);
    
    // Call mintNFT function with detailed error handling
    console.log('📝 Calling contract.mintNFT...');
    const tx = await contract.mintNFT(to, tokenURI, basePriceInWei);
    
    if (!tx) {
      throw new Error('Transaction returned undefined. Check wallet connection and contract deployment.');
    }
    
    console.log('✅ Transaction created:', {
      hash: tx.hash,
      type: typeof tx,
      hasWait: typeof tx.wait === 'function'
    });
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }
    
    console.log('✅ Transaction confirmed:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    });
    
    // Extract tokenId from the NFTMinted event
    console.log('🔍 Looking for NFTMinted event...');
    const mintEvent = receipt.logs.find(log => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === 'NFTMinted';
      } catch {
        return false;
      }
    });
    
    let tokenId = null;
    if (mintEvent) {
      const parsedEvent = contract.interface.parseLog(mintEvent);
      tokenId = parsedEvent.args.tokenId;
      console.log('✅ Found NFTMinted event, tokenId:', tokenId.toString());
    } else {
      console.log('⚠️ NFTMinted event not found in logs');
      // Try to extract from all events
      console.log('All events:', receipt.logs.map(log => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return { topic: log.topics[0] };
        }
      }));
    }
    
    const result = {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenId: tokenId ? tokenId.toString() : null,
    };
    
    console.log('🎉 Mint successful:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error minting NFT:', error);
    
    // Enhanced error information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
      stack: error.stack
    });
    
    // Provide user-friendly error messages
    let userMessage = error.message || 'Failed to mint NFT';
    
    if (error.code === 'ACTION_REJECTED') {
      userMessage = 'Transaction was rejected by user';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      userMessage = 'Insufficient funds for transaction';
    } else if (error.code === 'NETWORK_ERROR') {
      userMessage = 'Network error. Please check your connection';
    } else if (error.code === 'INVALID_ARGUMENT') {
      userMessage = 'Invalid parameters provided';
    } else if (error.reason) {
      userMessage = error.reason;
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Buy NFT from the marketplace
 * @param {number} tokenId - Token ID to buy
 * @param {string} price - Price in ETH
 * @returns {Promise<Object>} Transaction result
 */
export const buyNFT = async (tokenId, price) => {
  try {
    const contract = await getNFTMarketplaceContract();
    
    // Convert price to Wei
    const priceInWei = ethers.parseEther(price.toString());
    
    // Call buyNFT function
    const tx = await contract.buyNFT(tokenId, {
      value: priceInWei,
    });
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to buy NFT');
  }
};

/**
 * List NFT for sale
 * @param {number} tokenId - Token ID to list
 * @returns {Promise<Object>} Transaction result
 */
export const listNFTForSale = async (tokenId) => {
  try {
    const contract = await getNFTMarketplaceContract();
    
    const tx = await contract.listForSale(tokenId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error listing NFT for sale:', error);
    throw new Error(error.reason || error.message || 'Failed to list NFT for sale');
  }
};

/**
 * Delist NFT from sale
 * @param {number} tokenId - Token ID to delist
 * @returns {Promise<Object>} Transaction result
 */
export const delistNFTFromSale = async (tokenId) => {
  try {
    const contract = await getNFTMarketplaceContract();
    
    const tx = await contract.delistFromSale(tokenId);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error delisting NFT from sale:', error);
    throw new Error(error.reason || error.message || 'Failed to delist NFT from sale');
  }
};

/**
 * List NFT for rent
 * @param {number} tokenId - Token ID to list
 * @param {string} dailyRate - Daily rental rate in ETH
 * @returns {Promise<Object>} Transaction result
 */
export const listNFTForRent = async (tokenId, dailyRate) => {
  try {
    const contract = await getNFTMarketplaceContract();
    
    const dailyRateInWei = ethers.parseEther(dailyRate.toString());
    
    const tx = await contract.listForRent(tokenId, dailyRateInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error listing NFT for rent:', error);
    throw new Error(error.reason || error.message || 'Failed to list NFT for rent');
  }
};

/**
 * Rent NFT
 * @param {number} tokenId - Token ID to rent
 * @param {number} durationInDays - Rental duration in days
 * @param {string} totalCost - Total cost in ETH
 * @returns {Promise<Object>} Transaction result
 */
export const rentNFT = async (tokenId, durationInDays, totalCost) => {
  try {
    const contract = await getNFTMarketplaceContract();
    
    const totalCostInWei = ethers.parseEther(totalCost.toString());
    
    const tx = await contract.rentNFT(tokenId, durationInDays, {
      value: totalCostInWei,
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error renting NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to rent NFT');
  }
};

/**
 * Get NFT details from smart contract
 * @param {number} tokenId - Token ID
 * @returns {Promise<Object>} NFT details
 */
export const getNFTDetailsFromContract = async (tokenId) => {
  try {
    const contract = await getNFTMarketplaceContractReadOnly();
    
    const details = await contract.getNFTDetails(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);
    const owner = await contract.ownerOf(tokenId);
    
    return {
      tokenId,
      owner,
      tokenURI,
      basePrice: ethers.formatEther(details.basePrice),
      isListedForSale: details.isListedForSale,
      isListedForRent: details.isListedForRent,
      rentPricePerDay: ethers.formatEther(details.rentPricePerDay),
      isCurrentlyRented: details.isCurrentlyRented,
      currentRenter: details.currentRenter,
      isLocked: details.isLocked,
    };
  } catch (error) {
    console.error('Error getting NFT details from contract:', error);
    throw new Error(error.reason || error.message || 'Failed to get NFT details');
  }
};

/**
 * Get all NFTs from smart contract (this will replace backend fetching)
 * @returns {Promise<Array>} Array of NFT details
 */
export const getAllNFTsFromContract = async () => {
  try {
    const contract = await getNFTMarketplaceContractReadOnly();
    
    // Get total number of NFTs minted (assuming token IDs start from 0)
    // We'll need to find the latest token ID by checking Transfer events or implementing a counter in the contract
    const nfts = [];
    let tokenId = 0;
    
    // Try to get NFTs up to a reasonable limit (we can optimize this later)
    while (tokenId < 1000) { // Arbitrary limit to prevent infinite loop
      try {
        const details = await contract.getNFTDetails(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        const owner = await contract.ownerOf(tokenId);
        
        nfts.push({
          tokenId,
          owner,
          tokenURI,
          basePrice: parseFloat(ethers.formatEther(details.basePrice)),
          isForSale: details.isListedForSale,
          isForRent: details.isListedForRent,
          rentPricePerDay: parseFloat(ethers.formatEther(details.rentPricePerDay)),
          isCurrentlyRented: details.isCurrentlyRented,
          currentRenter: details.currentRenter,
          isLocked: details.isLocked,
        });
        
        tokenId++;
      } catch (error) {
        // If token doesn't exist, we've reached the end
        if (error.message.includes('Token does not exist') || error.message.includes('ERC721NonexistentToken')) {
          break;
        }
        tokenId++;
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error getting all NFTs from contract:', error);
    throw new Error('Failed to fetch NFTs from blockchain');
  }
};

/**
 * Get MON balance of an address
 * @param {string} address - Wallet address
 * @returns {Promise<string>} Balance in ETH
 */
export const getBalance = async (address) => {
  try {
    const { provider } = await getProviderAndSigner();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

/**
 * Listen for account changes
 * @param {function} callback - Callback function to handle account change
 */
export const onAccountsChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

/**
 * Listen for chain changes
 * @param {function} callback - Callback function to handle chain change
 */
export const onChainChanged = (callback) => {
  if (isMetaMaskInstalled()) {
    window.ethereum.on('chainChanged', callback);
  }
};

/**
 * Remove event listeners
 */
export const removeListeners = () => {
  if (isMetaMaskInstalled()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

/**
 * Lock NFT for Price Reactive functionality
 * @param {number} tokenId - Token ID to lock
 * @param {number} lockDurationInDays - Lock duration in days
 * @returns {Promise<Object>} Transaction result
 */
export const lockNFT = async (tokenId, lockDurationInDays) => {
  try {
    console.log('🔒 Starting NFT lock process...', { tokenId, lockDurationInDays });
    
    const contract = await getNFTMarketplaceContract();
    
    const tx = await contract.lockNFT(tokenId, lockDurationInDays);
    const receipt = await tx.wait();
    
    console.log('✅ NFT locked successfully');
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('❌ Error locking NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to lock NFT');
  }
};

/**
 * Unlock NFT (end Price Reactive period)
 * @param {number} tokenId - Token ID to unlock
 * @returns {Promise<Object>} Transaction result
 */
export const unlockNFT = async (tokenId) => {
  try {
    console.log('🔓 Starting NFT unlock process...', { tokenId });
    
    const contract = await getNFTMarketplaceContract();
    
    const tx = await contract.unlockNFT(tokenId);
    const receipt = await tx.wait();
    
    console.log('✅ NFT unlocked successfully');
    
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('❌ Error unlocking NFT:', error);
    throw new Error(error.reason || error.message || 'Failed to unlock NFT');
  }
}; 