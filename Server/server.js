// app.js - Complete Express.js application with MongoDB integration
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Web3 } = require('web3');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Import services and utilities
const DatabaseService = require('./services/DatabaseService');
const BlockchainService = require('./services/BlockchainService');
const IPFSService = require('./services/IPFSService');
const { validateAddress, validateBountyData } = require('./utils/validators');
const { handleErrors } = require('./utils/decorators');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Configuration
const config = {
    // Blockchain Configuration
    WEB3_PROVIDER_URL: process.env.WEB3_PROVIDER_URL || 'http://127.0.0.1:8545',
    PRIVATE_KEY: process.env.PRIVATE_KEY || '',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    CHAIN_ID: parseInt(process.env.CHAIN_ID) || 31337,
    
    // IPFS Configuration
    PINATA_API_KEY: process.env.PINATA_API_KEY || '',
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || '',
    PINATA_JWT: process.env.PINATA_JWT || '',
    IPFS_NODE_URL: process.env.IPFS_NODE_URL || '/ip4/127.0.0.1/tcp/5001',
    USE_PINATA: process.env.USE_PINATA?.toLowerCase() === 'true'
};

// Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"}
        ],
        "name": "cancelBounty",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_title", "type": "string"},
            {"internalType": "string", "name": "_description", "type": "string"},
            {"internalType": "string", "name": "_ipfsHash", "type": "string"},
            {"internalType": "uint256", "name": "_deadline", "type": "uint256"},
            {"internalType": "string[]", "name": "_allowedRoles", "type": "string[]"}
        ],
        "name": "createBounty",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"}
        ],
        "name": "getBounty",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "id", "type": "uint256"},
                    {"internalType": "address", "name": "creator", "type": "address"},
                    {"internalType": "string", "name": "title", "type": "string"},
                    {"internalType": "string", "name": "description", "type": "string"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "uint256", "name": "deadline", "type": "uint256"},
                    {"internalType": "uint256", "name": "rewardAmount", "type": "uint256"},
                    {"internalType": "enum BountyMarketplace.BountyStatus", "name": "status", "type": "uint8"},
                    {"internalType": "uint256", "name": "totalSubmissions", "type": "uint256"},
                    {"internalType": "uint256", "name": "winningSubmissionId", "type": "uint256"},
                    {"internalType": "string[]", "name": "allowedRoles", "type": "string[]"},
                    {"internalType": "uint256", "name": "votingEndTime", "type": "uint256"},
                    {"internalType": "bool", "name": "fundsReleased", "type": "bool"}
                ],
                "internalType": "struct BountyMarketplace.Bounty",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"}
        ],
        "name": "getBountySubmissions",
        "outputs": [
            {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_submissionId", "type": "uint256"}
        ],
        "name": "getSubmission",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "id", "type": "uint256"},
                    {"internalType": "uint256", "name": "bountyId", "type": "uint256"},
                    {"internalType": "address", "name": "contributor", "type": "address"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "uint256", "name": "voteCount", "type": "uint256"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                    {"internalType": "enum BountyMarketplace.SubmissionStatus", "name": "status", "type": "uint8"}
                ],
                "internalType": "struct BountyMarketplace.Submission",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalBounties",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_user", "type": "address"}
        ],
        "name": "getUserReputation",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"}
        ],
        "name": "selectWinnerAndPayout",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"}
        ],
        "name": "startVotingPhase",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"},
            {"internalType": "string", "name": "_ipfsHash", "type": "string"}
        ],
        "name": "submitWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_bountyId", "type": "uint256"},
            {"internalType": "uint256", "name": "_submissionId", "type": "uint256"}
        ],
        "name": "voteOnSubmission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize Web3
const web3 = new Web3(config.WEB3_PROVIDER_URL);

// Initialize contract
let contract;
try {
    contract = new web3.eth.Contract(CONTRACT_ABI, config.CONTRACT_ADDRESS);
    console.log('Smart contract initialized');
} catch (error) {
    console.error('Failed to initialize smart contract:', error);
}

// Initialize services
let dbService, blockchainService, ipfsService;

async function initializeServices() {
    try {
        await DatabaseService.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
        dbService = DatabaseService; // assign the class itself for static usage
        console.log('Database service initialized');

        blockchainService = new BlockchainService(
            config.WEB3_PROVIDER_URL,
            config.PRIVATE_KEY,
            config.CONTRACT_ADDRESS,
            CONTRACT_ABI
        );
        console.log('Blockchain service initialized');

        ipfsService = new IPFSService(config);
        console.log('IPFS service initialized');
    } catch (error) {
        console.error('Failed to initialize services:', error);
    }
}

// Utility functions
function serializeDoc(doc) {
    if (doc === null || doc === undefined) return null;
    
    if (Array.isArray(doc)) {
        return doc.map(item => serializeDoc(item));
    }
    
    if (typeof doc === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(doc)) {
            if (key === '_id') continue; // Skip MongoDB ObjectId
            
            if (value && typeof value.toString === 'function' && value.constructor.name === 'ObjectId') {
                result[key] = value.toString();
            } else if (value instanceof Date) {
                result[key] = value.toISOString();
            } else if (typeof value === 'object') {
                result[key] = serializeDoc(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    
    return doc;
}

async function uploadToPinata(fileBuffer, filename) {
    const formData = new FormData();
    formData.append('file', fileBuffer, filename);
    
    const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
            uploadedAt: new Date().toISOString(),
            platform: 'bounty-marketplace'
        }
    });
    
    formData.append('pinataMetadata', metadata);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
    
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
            ...formData.getHeaders(),
            'pinata_api_key': config.PINATA_API_KEY,
            'pinata_secret_api_key': config.PINATA_SECRET_KEY
        }
    });
    
    return response.data.IpfsHash;
}

async function getBountyFromBlockchain(bountyId) {
    try {
        const bountyData = await contract.methods.getBounty(bountyId).call();
        
        return {
            id: bountyData[0],
            bounty_id: bountyData[0],
            creator: bountyData[1],
            creator_address: bountyData[1],
            title: bountyData[2],
            description: bountyData[3],
            ipfs_hash: bountyData[4],
            deadline: bountyData[5],
            reward_amount: bountyData[6].toString(),
            status: ['active', 'voting', 'completed', 'cancelled'][bountyData[7]] || 'unknown',
            total_submissions: bountyData[8],
            winning_submission_id: bountyData[9],
            allowed_roles: bountyData[10],
            voting_end_time: bountyData[11],
            funds_released: bountyData[12],
            deadline_readable: new Date(bountyData[5] * 1000).toISOString(),
            reward_amount_eth: web3.utils.fromWei(bountyData[6].toString(), 'ether')
        };
    } catch (error) {
        console.error(`Error fetching bounty ${bountyId} from blockchain:`, error);
        return null;
    }
}

async function getBountiesFromBlockchain() {
    try {
        const totalBounties = await contract.methods.getTotalBounties().call();
        const bounties = [];
        
        for (let bountyId = 1; bountyId <= totalBounties; bountyId++) {
            try {
                const bountyData = await getBountyFromBlockchain(bountyId);
                if (bountyData) {
                    bounties.push(bountyData);
                }
            } catch (error) {
                console.warn(`Failed to fetch bounty ${bountyId}:`, error);
                continue;
            }
        }
        
        return bounties;
    } catch (error) {
        console.error('Failed to fetch bounties from blockchain:', error);
        return [];
    }
}

function prepareCreateBountyTransaction(data) {
    const creatorAddress = web3.utils.toChecksumAddress(data.creator_address);
    const rewardWei = web3.utils.toWei(data.reward_amount.toString(), 'ether');
    
    const transaction = contract.methods.createBounty(
        data.title,
        data.description,
        data.ipfs_hash,
        parseInt(data.deadline),
        data.allowed_roles || []
    );
    
    return {
        to: config.CONTRACT_ADDRESS,
        from: creatorAddress,
        value: rewardWei,
        gas: 500000,
        gasPrice: web3.utils.toWei('20', 'gwei'),
        data: transaction.encodeABI()
    };
}

// API Routes

// Health check endpoint
app.get('/health', handleErrors(async (req, res) => {
    let dbConnected = false;
    if (dbService) {
        try {
            await dbService.ping();
            dbConnected = true;
        } catch (error) {
            dbConnected = false;
        }
    }
    
    const web3Connected = await web3.eth.net.isListening().catch(() => false);
    
    res.json({
        status: 'healthy',
        web3_connected: web3Connected,
        mongodb_connected: dbConnected,
        contract_address: config.CONTRACT_ADDRESS,
        timestamp: new Date().toISOString()
    });
}));

// File upload endpoint
app.post('/upload', upload.single('file'), handleErrors(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file provided'
        });
    }
    
    const uploaderAddress = req.body.uploader_address;
    if (uploaderAddress && !validateAddress(uploaderAddress)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid uploader address'
        });
    }
    
    try {
        let ipfsHash;
        
        if (config.USE_PINATA && config.PINATA_API_KEY) {
            ipfsHash = await uploadToPinata(req.file.buffer, req.file.originalname);
        } else {
            ipfsHash = await ipfsService.uploadFile(req.file.buffer);
        }
        
        // Store file metadata in database
        if (dbService) {
            const fileMetadata = {
                filename: req.file.originalname,
                ipfs_hash: ipfsHash,
                file_size: req.file.size,
                content_type: req.file.mimetype,
                uploader_address: uploaderAddress?.toLowerCase(),
                uploaded_at: new Date()
            };
            
            await dbService.createFile(fileMetadata);
        }
        
        console.log(`File uploaded to IPFS: ${ipfsHash}`);
        
        res.json({
            success: true,
            ipfs_hash: ipfsHash,
            filename: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('File upload failed:', error);
        res.status(500).json({
            success: false,
            error: `File upload failed: ${error.message}`
        });
    }
}));

// Bounties endpoint
app.route('/bounties')
    .get(handleErrors(async (req, res) => {
        const { status, creator, category, search, limit = 50, skip = 0 } = req.query;
        const limitNum = Math.min(parseInt(limit), 100);
        const skipNum = parseInt(skip);
        
        try {
            let bounties = [];
            
            if (dbService) {
                if (search) {
                    bounties = await dbService.searchBounties(search, limitNum);
                } else {
                    bounties = await dbService.getBounties(status, creator, limitNum, skipNum);
                }
                
                // Sync with blockchain for critical data
                const syncedBounties = [];
                for (const bounty of bounties) {
                    try {
                        if (bounty.bounty_id > 0) {
                            const blockchainData = await getBountyFromBlockchain(bounty.bounty_id);
                            if (blockchainData) {
                                const mergedBounty = { ...serializeDoc(bounty), ...blockchainData };
                                
                                // Update database if status changed
                                if (bounty.status !== blockchainData.status) {
                                    await dbService.updateBountyStatus(bounty.bounty_id, blockchainData.status);
                                }
                                
                                syncedBounties.push(mergedBounty);
                            } else {
                                syncedBounties.push(serializeDoc(bounty));
                            }
                        } else {
                            syncedBounties.push(serializeDoc(bounty));
                        }
                    } catch (error) {
                        console.warn(`Failed to sync bounty ${bounty.bounty_id}:`, error);
                        syncedBounties.push(serializeDoc(bounty));
                    }
                }
                bounties = syncedBounties;
            } else {
                bounties = await getBountiesFromBlockchain();
            }
            
            res.json({
                success: true,
                bounties: bounties.map(b => b._doc ? { ...b._doc, id: b._id } : b),
                total_count: bounties.length,
                has_more: bounties.length === limitNum
            });
        } catch (error) {
            console.error('Failed to fetch bounties:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }))
    .post(handleErrors(async (req, res) => {
        const data = req.body;
        
        // Validate input data
        const validationError = validateBountyData(data);
        if (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError
            });
        }
        
        try {
            // Prepare blockchain transaction
            const transactionData = prepareCreateBountyTransaction(data);
            
            if (dbService) {
                // Store bounty in database (pending state)
                const bountyData = {
                    bounty_id: 0,
                    creator_address: data.creator_address,
                    title: data.title,
                    description: data.description,
                    ipfs_hash: data.ipfs_hash,
                    deadline: parseInt(data.deadline),
                    reward_amount: data.reward_amount.toString(),
                    allowed_roles: data.allowed_roles || [],
                    transaction_hash: 'pending',
                    category: data.category,
                    tags: data.tags || [],
                    difficulty_level: data.difficulty_level,
                    estimated_time: data.estimated_time,
                    requirements: data.requirements || []
                };
                
                await dbService.createBounty(bountyData);
                await dbService.createOrUpdateUser(data.creator_address);
            }
            
            res.json({
                success: true,
                transaction_data: transactionData,
                message: 'Bounty prepared. Sign and send transaction to create on blockchain.'
            });
        } catch (error) {
            console.error('Failed to create bounty:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }));

// Get bounty details
app.get('/bounties/:bountyId', handleErrors(async (req, res) => {
    const bountyId = parseInt(req.params.bountyId);
    
    try {
        let bounty = null;
        
        if (dbService) {
            await dbService.incrementBountyViews(bountyId);
            bounty = await dbService.getBountyById(bountyId);
            if (bounty) {
                bounty = serializeDoc(bounty);
            }
        }
        
        // Sync with blockchain
        const blockchainData = await getBountyFromBlockchain(bountyId);
        if (blockchainData) {
            if (bounty) {
                bounty = { ...bounty, ...blockchainData };
            } else {
                bounty = blockchainData;
            }
        } else if (!bounty) {
            return res.status(404).json({
                success: false,
                error: 'Bounty not found'
            });
        }
        
        // Get submissions
        let submissions = [];
        if (dbService) {
            submissions = await dbService.getSubmissionsByBounty(bountyId);
            submissions = serializeDoc(submissions);
        }
        
        res.json({
            success: true,
            bounty,
            submissions,
            total_submissions: submissions.length
        });
    } catch (error) {
        console.error('Failed to get bounty details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));

// Submit work
app.post('/bounties/:bountyId/submit', handleErrors(async (req, res) => {
    const bountyId = parseInt(req.params.bountyId);
    if (isNaN(bountyId)) {
        return res.status(400).json({ success: false, error: "Invalid bountyId" });
    }
    const { ipfs_hash, wallet_address, description, file_type, file_size } = req.body;
    
    if (!ipfs_hash || !wallet_address) {
        return res.status(400).json({
            success: false,
            error: 'ipfs_hash and wallet_address are required'
        });
    }
    
    if (!validateAddress(wallet_address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid wallet address'
        });
    }
    
    try {
        // Get nonce for transaction
        const nonce = await web3.eth.getTransactionCount(web3.utils.toChecksumAddress(wallet_address));
        
        const transaction = contract.methods.submitWork(bountyId, ipfs_hash);
        
        const transactionData = {
            to: config.CONTRACT_ADDRESS,
            from: web3.utils.toChecksumAddress(wallet_address),
            gas: 300000,
            gasPrice: web3.utils.toWei('20', 'gwei'),
            nonce,
            data: transaction.encodeABI()
        };
        
        // Store submission in database
        if (dbService) {
            const submissionData = {
                submission_id: 0,
                bounty_id: bountyId,
                contributor_address: wallet_address,
                ipfs_hash,
                transaction_hash: 'pending',
                description: description || '',
                file_type,
                file_size
            };
            
            await dbService.createSubmission(submissionData);
        }
        
        res.json({
            success: true,
            transaction_data: transactionData,
            message: 'Submission prepared. Sign and send transaction.'
        });
    } catch (error) {
        console.error('Failed to submit work:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));

// Start voting phase
app.post('/bounties/:bountyId/start-voting', handleErrors(async (req, res) => {
    const bountyId = parseInt(req.params.bountyId);
    const { wallet_address } = req.body;
    
    if (!wallet_address || !validateAddress(wallet_address)) {
        return res.status(400).json({
            success: false,
            error: 'Valid wallet_address is required'
        });
    }
    
    try {
        const nonce = await web3.eth.getTransactionCount(web3.utils.toChecksumAddress(wallet_address));
        
        const transaction = contract.methods.startVotingPhase(bountyId);
        
        const transactionData = {
            to: config.CONTRACT_ADDRESS,
            from: web3.utils.toChecksumAddress(wallet_address),
            gas: 200000,
            gasPrice: web3.utils.toWei('20', 'gwei'),
            nonce,
            data: transaction.encodeABI()
        };
        
        res.json({
            success: true,
            transaction_data: transactionData,
            message: 'Voting phase transaction prepared'
        });
    } catch (error) {
        console.error('Failed to start voting phase:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));

// Vote on submission
app.post('/bounties/:bountyId/vote', handleErrors(async (req, res) => {
    const bountyId = parseInt(req.params.bountyId);
    const { submission_id, voter_wallet } = req.body;
    
    if (!submission_id || !voter_wallet) {
        return res.status(400).json({
            success: false,
            error: 'submission_id and voter_wallet are required'
        });
    }
    
    if (!validateAddress(voter_wallet)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid voter wallet address'
        });
    }
    
    try {
        const nonce = await web3.eth.getTransactionCount(web3.utils.toChecksumAddress(voter_wallet));
        
        const transaction = contract.methods.voteOnSubmission(bountyId, submission_id);
        
        const transactionData = {
            to: config.CONTRACT_ADDRESS,
            from: web3.utils.toChecksumAddress(voter_wallet),
            gas: 200000,
            gasPrice: web3.utils.toWei('20', 'gwei'),
            nonce,
            data: transaction.encodeABI()
        };
        
        res.json({
            success: true,
            transaction_data: transactionData,
            message: 'Vote transaction prepared'
        });
    } catch (error) {
        console.error('Failed to vote on submission:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));

// Get bounty submissions
app.get('/bounties/:bountyId/submissions', handleErrors(async (req, res) => {
    const bountyId = parseInt(req.params.bountyId);
    
    try {
        let submissions = [];
        
        if (dbService) {
            submissions = await dbService.getSubmissionsByBounty(bountyId);
            submissions = serializeDoc(submissions);
        }
        
        res.json({
            success: true,
            submissions,
            total_submissions: submissions.length
        });
    } catch (error) {
        console.error('Failed to get submissions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Initialize services and start server
async function startServer() {
    try {
        await initializeServices();
        
        app.listen(PORT, () => {
            console.log(`🚀 Bounty Marketplace API running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (dbService) {
        await dbService.disconnect();
    }
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

startServer();

module.exports = app;