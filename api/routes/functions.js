/**
 * Function Deployment API Routes
 * 
 * Handles function registration, deployment, and management
 */

const express = require('express');
const { ethers } = require('ethers');
const chalk = require('chalk');
const router = express.Router();

// Import contract configuration
const CONTRACT_CONFIG = {
  address: process.env.CONTRACT_ADDRESS || '0xA0008C89d0773C6bA854E05D72dC15Aa5E4012c8',
  rpcUrl: process.env.RPC_URL || 'https://testnet-rpc.monad.xyz',
  privateKey: process.env.PRIVATE_KEY
};

// Contract ABI (simplified for key functions)
const REGISTRY_ABI = [
  'function registerFunction(string calldata name, string calldata description, bytes32 wasmHash, uint256 gasLimit, string calldata runtime) external returns (uint256 functionId)',
  'function addTrigger(uint256 functionId, uint8 triggerType, bytes calldata triggerData) external returns (uint256 triggerId)',
  'function fireTrigger(uint256 triggerId, bytes calldata contextData) external',
  'function getFunction(uint256 functionId) external view returns (tuple)',
  'function getTrigger(uint256 triggerId) external view returns (tuple)',
  'function nextFunctionId() external view returns (uint256)',
  'function nextTriggerId() external view returns (uint256)',
  'event FunctionRegistered(uint256 indexed functionId, address indexed owner, string name, bytes32 wasmHash)',
  'event TriggerAdded(uint256 indexed triggerId, uint256 indexed functionId, uint8 triggerType)',
  'event TriggerFired(uint256 indexed triggerId, uint256 indexed functionId, bytes contextData)'
];

const TriggerType = {
  HTTP_WEBHOOK: 0,
  ON_CHAIN_EVENT: 1,
  PRICE_THRESHOLD: 2,
  TIME_BASED: 3,
  CUSTOM: 4
};

// Initialize blockchain connection
let provider, wallet, registry;

function initializeBlockchain() {
  if (!CONTRACT_CONFIG.privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }
  
  provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
  wallet = new ethers.Wallet(CONTRACT_CONFIG.privateKey, provider);
  registry = new ethers.Contract(CONTRACT_CONFIG.address, REGISTRY_ABI, wallet);
  
  console.log(chalk.green('🔗 Blockchain connection initialized'));
}

// Initialize on module load
try {
  initializeBlockchain();
} catch (error) {
  console.error(chalk.red('❌ Failed to initialize blockchain:'), error.message);
}

// Deploy a new function
router.post('/deploy', async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      runtime = 'javascript',
      triggerType = 'PRICE_THRESHOLD',
      triggerConfig = {},
      gasLimit = 500000
    } = req.body;

    // Validate input
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Function name and code are required'
      });
    }

    console.log(chalk.cyan(`🚀 Deploying function: ${name}`));

    // Step 1: Compile code to WASM hash (mock for demo)
    const wasmHash = ethers.keccak256(ethers.toUtf8Bytes(code + runtime + Date.now()));
    
    // Step 2: Register function on-chain
    const tx = await registry.registerFunction(
      name,
      description || `${name} - Deployed via MonadFaas API`,
      wasmHash,
      gasLimit,
      runtime,
      {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits('75', 'gwei')
      }
    );

    const receipt = await tx.wait();
    
    // Extract function ID from events
    const log = receipt.logs.find(log => {
      try {
        const parsed = registry.interface.parseLog(log);
        return parsed?.name === 'FunctionRegistered';
      } catch { return false; }
    });

    const functionId = log ? Number(registry.interface.parseLog(log).args[0]) : null;
    
    if (!functionId) {
      throw new Error('Failed to extract function ID from transaction');
    }

    // Step 3: Add trigger
    let triggerId = null;
    if (triggerType && triggerConfig) {
      const triggerData = encodeTriggerData(triggerType, triggerConfig);
      const triggerTypeEnum = TriggerType[triggerType] ?? TriggerType.CUSTOM;
      
      const triggerTx = await registry.addTrigger(
        functionId,
        triggerTypeEnum,
        triggerData,
        {
          gasLimit: 200000,
          gasPrice: ethers.parseUnits('75', 'gwei')
        }
      );

      const triggerReceipt = await triggerTx.wait();
      
      // Extract trigger ID from events
      const triggerLog = triggerReceipt.logs.find(log => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed?.name === 'TriggerAdded';
        } catch { return false; }
      });

      triggerId = triggerLog ? Number(registry.interface.parseLog(triggerLog).args[0]) : null;
    }

    // Step 4: Store function metadata
    const metadata = {
      functionId,
      triggerId,
      name,
      description,
      code,
      runtime,
      triggerType,
      triggerConfig,
      wasmHash,
      deployedAt: new Date().toISOString(),
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };

    console.log(chalk.green(`✅ Function deployed successfully: ID ${functionId}`));

    res.json({
      success: true,
      data: {
        functionId,
        triggerId,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        metadata
      }
    });

  } catch (error) {
    console.error(chalk.red('❌ Function deployment failed:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test function execution
router.post('/:functionId/test', async (req, res) => {
  try {
    const { functionId } = req.params;
    const { triggerId, testData = {} } = req.body;

    if (!triggerId) {
      return res.status(400).json({
        success: false,
        error: 'Trigger ID is required for testing'
      });
    }

    console.log(chalk.cyan(`🧪 Testing function ${functionId} with trigger ${triggerId}`));

    const contextData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'uint256', 'string'],
      [
        'test',
        Math.floor(Date.now() / 1000),
        JSON.stringify(testData)
      ]
    );

    const tx = await registry.fireTrigger(triggerId, contextData, {
      gasLimit: 150000,
      gasPrice: ethers.parseUnits('75', 'gwei')
    });

    const receipt = await tx.wait();

    console.log(chalk.green(`✅ Function test completed: ${tx.hash}`));

    res.json({
      success: true,
      data: {
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed'
      }
    });

  } catch (error) {
    console.error(chalk.red('❌ Function test failed:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get function details
router.get('/:functionId', async (req, res) => {
  try {
    const { functionId } = req.params;
    
    const functionData = await registry.getFunction(functionId);
    
    res.json({
      success: true,
      data: {
        functionId: Number(functionId),
        wasmHash: functionData.wasmHash,
        name: functionData.name,
        description: functionData.description,
        owner: functionData.owner,
        gasLimit: functionData.gasLimit.toString(),
        active: functionData.active,
        createdAt: new Date(Number(functionData.createdAt) * 1000).toISOString(),
        executionCount: functionData.executionCount.toString(),
        runtime: functionData.runtime
      }
    });

  } catch (error) {
    console.error(chalk.red('❌ Failed to get function:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all functions (mock implementation)
router.get('/', async (req, res) => {
  try {
    // In a real implementation, this would query the blockchain for all functions
    // For demo purposes, we'll return a mock list
    const nextFunctionId = await registry.nextFunctionId();
    const functions = [];
    
    // Get last 10 functions
    const startId = Math.max(1, Number(nextFunctionId) - 10);
    for (let i = startId; i < Number(nextFunctionId); i++) {
      try {
        const functionData = await registry.getFunction(i);
        if (functionData.active) {
          functions.push({
            functionId: i,
            name: functionData.name,
            description: functionData.description,
            owner: functionData.owner,
            runtime: functionData.runtime,
            createdAt: new Date(Number(functionData.createdAt) * 1000).toISOString(),
            executionCount: functionData.executionCount.toString()
          });
        }
      } catch (error) {
        // Function might not exist, skip
        continue;
      }
    }

    res.json({
      success: true,
      data: functions
    });

  } catch (error) {
    console.error(chalk.red('❌ Failed to list functions:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to encode trigger data
function encodeTriggerData(triggerType, config) {
  switch (triggerType) {
    case 'PRICE_THRESHOLD':
      return ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'uint256'],
        [config.token || 'ETH', ethers.parseEther(config.threshold?.toString() || '1000')]
      );
    
    case 'HTTP_WEBHOOK':
      return ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        [config.url || '']
      );
    
    case 'TIME_BASED':
      return ethers.AbiCoder.defaultAbiCoder().encode(
        ['uint256'],
        [config.interval || 3600] // Default 1 hour
      );
    
    default:
      return ethers.AbiCoder.defaultAbiCoder().encode(
        ['string'],
        [JSON.stringify(config)]
      );
  }
}

module.exports = router;
