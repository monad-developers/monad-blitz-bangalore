require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const fs = require('fs');
const logger = require('./logger');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory map to store verified users
const verifiedUsersMap = new Map();

// File path to persist verified users data
const VERIFIED_USERS_FILE = './verified_users.json';

// Load verified users from file on startup
function loadVerifiedUsers() {
  try {
    if (fs.existsSync(VERIFIED_USERS_FILE)) {
      const data = fs.readFileSync(VERIFIED_USERS_FILE, 'utf8');
      const usersArray = JSON.parse(data);
      
      // Convert array back to Map
      usersArray.forEach(user => {
        verifiedUsersMap.set(user.address.toLowerCase(), {
          address: user.address,
          verifiedAt: new Date(user.verifiedAt),
          transactionHash: user.transactionHash
        });
      });
      
      logger.info(`Loaded ${verifiedUsersMap.size} verified users from file`);
    } else {
      logger.info('No existing verified users file found, starting fresh');
    }
  } catch (error) {
    logger.error(`Failed to load verified users: ${error.message}`);
  }
}

// Save verified users to file
function saveVerifiedUsers() {
  try {
    // Convert Map to array for JSON serialization
    const usersArray = Array.from(verifiedUsersMap.values()).map(user => ({
      address: user.address,
      verifiedAt: user.verifiedAt.toISOString(),
      transactionHash: user.transactionHash
    }));
    
    fs.writeFileSync(VERIFIED_USERS_FILE, JSON.stringify(usersArray, null, 2));
    logger.info(`Saved ${usersArray.length} verified users to file`);
  } catch (error) {
    logger.error(`Failed to save verified users: ${error.message}`);
  }
}

// log every incoming request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Load environment variables
const { PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS } = process.env;

// Validate environment variables
if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

// Load contract ABI - extract just the ABI array from the artifact
let abi;
try {
  const contractArtifact = JSON.parse(fs.readFileSync('./abi.json', 'utf8'));
  abi = contractArtifact.abi; // Extract the ABI array
  logger.info(`ABI loaded successfully with ${abi.length} items`);
} catch (error) {
  logger.error(`Failed to load ABI: ${error.message}`);
  process.exit(1);
}

// Set up provider and wallet (updated for ethers v6)
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// Verify contract deployment on startup
async function verifyContractDeployment() {
  try {
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      logger.error('No contract found at the specified address');
      process.exit(1);
    }
    logger.info('Contract verified at address:', CONTRACT_ADDRESS);
    
    // Test if we can call a view function
    const owner = await contract.owner();
    logger.info('Contract owner:', owner);
  } catch (error) {
    logger.error('Contract verification failed:', error.message);
  }
}

// API endpoint to verify a user
app.post('/verify', async (req, res) => {
  const { walletAddress } = req.body;

  if (!ethers.isAddress(walletAddress)) {
    logger.warn(`Invalid address attempt: ${walletAddress}`);
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const normalizedAddress = walletAddress.toLowerCase();

  try {
    // Check if user is already verified in our map
    if (verifiedUsersMap.has(normalizedAddress)) {
      logger.info(`User already verified in map: ${walletAddress}`);
      const existingUser = verifiedUsersMap.get(normalizedAddress);
      return res.json({ 
        message: 'User already verified', 
        transactionHash: existingUser.transactionHash,
        verifiedAt: existingUser.verifiedAt
      });
    }

    // For batch verification, pass as array
    const tx = await contract.verifyUser([walletAddress]);
    await tx.wait();
    
    // Add to verified users map
    const userRecord = {
      address: walletAddress,
      verifiedAt: new Date(),
      transactionHash: tx.hash
    };
    
    verifiedUsersMap.set(normalizedAddress, userRecord);
    
    // Save to file
    saveVerifiedUsers();
    
    logger.info(`User verified: ${walletAddress}, txHash: ${tx.hash}`);
    res.json({ 
      message: 'User verified successfully', 
      transactionHash: tx.hash,
      verifiedAt: userRecord.verifiedAt
    });
  } catch (error) {
    logger.error(`Error verifying user: ${error.message}`);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// API endpoint to check if a user is verified - Now uses local map first
app.get('/verify/:address', async (req, res) => {
  const { address } = req.params;

  if (!ethers.isAddress(address)) {
    logger.warn(`Invalid address check attempt: ${address}`);
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const normalizedAddress = address.toLowerCase();

  try {
    // First check in local map
    if (verifiedUsersMap.has(normalizedAddress)) {
      const userRecord = verifiedUsersMap.get(normalizedAddress);
      logger.info(`Found user in local map: ${address}`);
      return res.json({ 
        address, 
        isVerified: true,
        verifiedAt: userRecord.verifiedAt,
        transactionHash: userRecord.transactionHash,
        source: 'local_map'
      });
    }

    // If not in local map, check blockchain as fallback
    // logger.info(`User not in local map, checking blockchain for: ${address}`);
    
    // const isVerified = await Promise.race([
    //   contract.isVerified(address),
    //   new Promise((_, reject) => 
    //     setTimeout(() => reject(new Error('Contract call timeout')), 10000)
    //   )
    // ]);
    
    // If verified on blockchain but not in our map, add it
    // if (isVerified) {
    //   const userRecord = {
    //     address: address,
    //     verifiedAt: new Date(),
    //     transactionHash: 'unknown' // We don't have the original tx hash
    //   };
      
    //   verifiedUsersMap.set(normalizedAddress, userRecord);
    //   saveVerifiedUsers();
      
    //   logger.info(`Added verified user from blockchain to map: ${address}`);
    // }
    
    // logger.info(`Verification status for ${address}: ${isVerified}`);
    res.json({ 
      address, 
      isVerified: false,
      verifiedAt: 'not verified',
      transactionHash: 'not available',
      source: 'blockchain'
    });
    
  } catch (error) {
    logger.error(`Error checking verification status for ${address}: ${error.message}`);
    
    // More detailed error response
    let errorMessage = 'Failed to check verification status';
    if (error.message.includes('could not decode result data')) {
      errorMessage = 'Contract function call failed - possibly wrong contract address or ABI mismatch';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Contract call timed out';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// API endpoint to revoke verification
app.post('/revoke', async (req, res) => {
  const { userAddress } = req.body;

  if (!ethers.isAddress(userAddress)) {
    logger.warn(`Invalid address revoke attempt: ${userAddress}`);
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const normalizedAddress = userAddress.toLowerCase();

  try {
    // For batch revocation, pass as array
    const tx = await contract.revokeVerification([userAddress]);
    await tx.wait();
    
    // Remove from verified users map
    if (verifiedUsersMap.has(normalizedAddress)) {
      verifiedUsersMap.delete(normalizedAddress);
      saveVerifiedUsers();
      logger.info(`Removed user from verified map: ${userAddress}`);
    }
    
    logger.info(`User verification revoked: ${userAddress}, txHash: ${tx.hash}`);
    res.json({ 
      message: 'User verification revoked successfully', 
      transactionHash: tx.hash 
    });
  } catch (error) {
    logger.error(`Error revoking user verification: ${error.message}`);
    res.status(500).json({ error: 'Failed to revoke user verification' });
  }
});

// API endpoint to get all verified users
app.get('/verified-users', (req, res) => {
  const users = Array.from(verifiedUsersMap.values());
  res.json({ 
    count: users.length,
    users: users 
  });
});

// API endpoint to sync with blockchain (admin function)
app.post('/sync-blockchain', async (req, res) => {
  try {
    logger.info('Starting blockchain sync...');
    let syncCount = 0;
    
    // This is a basic sync - in a production app, you might want to listen to events
    // or maintain a list of addresses to check
    const allUsers = Array.from(verifiedUsersMap.keys());
    
    for (const address of allUsers) {
      try {
        const isVerified = await contract.isVerified(address);
        if (!isVerified) {
          // User is not verified on blockchain but is in our map - remove from map
          verifiedUsersMap.delete(address);
          syncCount++;
          logger.info(`Removed unverified user from map: ${address}`);
        }
      } catch (error) {
        logger.error(`Error checking ${address} during sync: ${error.message}`);
      }
    }
    
    saveVerifiedUsers();
    logger.info(`Blockchain sync completed. Updated ${syncCount} users`);
    
    res.json({ 
      message: 'Blockchain sync completed',
      updatedUsers: syncCount,
      totalUsers: verifiedUsersMap.size
    });
  } catch (error) {
    logger.error(`Error during blockchain sync: ${error.message}`);
    res.status(500).json({ error: 'Failed to sync with blockchain' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    verifiedUsersCount: verifiedUsersMap.size
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

// Load verified users on startup
loadVerifiedUsers();

app.listen(PORT, async () => {
  logger.info(`GhostPass backend server is running on port ${PORT}`);
  await verifyContractDeployment();
});