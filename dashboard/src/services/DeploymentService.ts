import { ethers } from 'ethers';
import MetricsService from './MetricsService';
import { CONTRACT_CONFIG } from '../contracts';

export interface FunctionDeploymentData {
  name: string;
  description: string;
  code: string;
  runtime: 'javascript' | 'python' | 'solidity';
  triggerType: string;
  triggerConfig: any;
  webhookUrl?: string;
  gasLimit: number;
}

export interface DeploymentResult {
  success: boolean;
  functionId?: number;
  triggerId?: number;
  txHash?: string;
  error?: string;
}

// Smart Contract Configuration
const CONFIG = {
  rpcUrl: CONTRACT_CONFIG.rpcUrl,
  registryAddress: CONTRACT_CONFIG.address,
  privateKey: process.env.REACT_APP_PRIVATE_KEY || '0xb480778fb8d22695cd5bc45337fbb300e784bd237c8a6f21a852cc41b98a081b',
  gasPrice: ethers.parseUnits('50', 'gwei'),
};

// Trigger Types (matching smart contract enum)
const TriggerType = {
  HTTP_WEBHOOK: 0,
  ON_CHAIN_EVENT: 1,
  PRICE_THRESHOLD: 2,
  TIME_BASED: 3,
  CUSTOM: 4
};

class DeploymentService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private registry: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.privateKey, this.provider);
    this.registry = new ethers.Contract(CONFIG.registryAddress, CONTRACT_CONFIG.abi, this.wallet);
  }

  // Deploy a complete function with trigger
  async deployFunction(functionData: FunctionDeploymentData): Promise<DeploymentResult> {
    try {
      console.log('Starting function deployment:', functionData.name);

      // Step 1: Compile code to WASM hash (mock for demo)
      const wasmHash = await this.compileToWasm(functionData.code, functionData.runtime);
      
      // Step 2: Register function on-chain
      const functionResult = await this.registerFunction(functionData, wasmHash);
      if (!functionResult.success || !functionResult.functionId) {
        return functionResult;
      }

      // Step 3: Add trigger
      const triggerResult = await this.addTrigger(
        functionResult.functionId,
        functionData.triggerType,
        functionData.triggerConfig
      );

      if (!triggerResult.success) {
        return {
          success: false,
          error: `Function registered but trigger failed: ${triggerResult.error}`
        };
      }

      // Step 4: Store function metadata for orchestrator
      await this.storeFunctionMetadata(functionResult.functionId, functionData);

      return {
        success: true,
        functionId: functionResult.functionId,
        triggerId: triggerResult.triggerId,
        txHash: functionResult.txHash
      };

    } catch (error) {
      console.error('Deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error'
      };
    }
  }

  // Register function on blockchain
  private async registerFunction(
    functionData: FunctionDeploymentData, 
    wasmHash: string
  ): Promise<DeploymentResult> {
    try {
      const startTime = Date.now();
      
      console.log('Registering function on blockchain...');
      
      const tx = await this.registry.registerFunction(
        functionData.name,
        functionData.description,
        ethers.keccak256(ethers.toUtf8Bytes(wasmHash)),
        functionData.gasLimit,
        functionData.runtime,
        {
          gasLimit: 300000,
          gasPrice: CONFIG.gasPrice
        }
      );

      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      // Record metrics
      const executionTime = Date.now() - startTime;
      MetricsService.recordFunctionRegistration(receipt.gasUsed, executionTime);

      // Extract function ID from events
      const log = receipt.logs.find((log: any) => {
        try {
          const parsed = this.registry.interface.parseLog(log);
          return parsed && parsed.name === 'FunctionRegistered';
        } catch {
          return false;
        }
      });

      if (log) {
        const parsed = this.registry.interface.parseLog(log);
        const functionId = Number(parsed!.args[0]);
        
        console.log('Function registered with ID:', functionId);
        
        return {
          success: true,
          functionId,
          txHash: tx.hash
        };
      }

      return {
        success: false,
        error: 'Function registration event not found'
      };

    } catch (error) {
      console.error('Function registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Add trigger for function
  private async addTrigger(
    functionId: number,
    triggerType: string,
    triggerConfig: any
  ): Promise<DeploymentResult> {
    try {
      const startTime = Date.now();
      
      console.log('Adding trigger for function:', functionId);

      // Map trigger type string to enum
      const triggerTypeEnum = this.mapTriggerType(triggerType);
      
      // Encode trigger data
      const triggerData = this.encodeTriggerData(triggerType, triggerConfig);

      const tx = await this.registry.addTrigger(
        functionId,
        triggerTypeEnum,
        triggerData,
        {
          gasLimit: 200000,
          gasPrice: CONFIG.gasPrice
        }
      );

      console.log('Trigger transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      // Record metrics
      const executionTime = Date.now() - startTime;
      MetricsService.recordTriggerCreation(receipt.gasUsed, executionTime);

      // Extract trigger ID from events
      const log = receipt.logs.find((log: any) => {
        try {
          const parsed = this.registry.interface.parseLog(log);
          return parsed && parsed.name === 'TriggerAdded';
        } catch {
          return false;
        }
      });

      if (log) {
        const parsed = this.registry.interface.parseLog(log);
        const triggerId = Number(parsed!.args[0]);
        
        console.log('Trigger added with ID:', triggerId);
        
        return {
          success: true,
          triggerId,
          txHash: tx.hash
        };
      }

      return {
        success: false,
        error: 'Trigger creation event not found'
      };

    } catch (error) {
      console.error('Trigger creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Trigger creation failed'
      };
    }
  }

  // Compile code to WASM (mock implementation for demo)
  private async compileToWasm(code: string, runtime: string): Promise<string> {
    // In production, this would:
    // 1. Send code to compilation service
    // 2. Compile to WASM
    // 3. Upload to IPFS
    // 4. Return IPFS hash
    
    // For demo, create a deterministic hash based on code
    const hash = ethers.keccak256(ethers.toUtf8Bytes(code + runtime));
    const mockIpfsHash = `Qm${hash.slice(2, 34)}`;
    
    console.log('Mock WASM compilation completed:', mockIpfsHash);
    return mockIpfsHash;
  }

  // Map trigger type string to contract enum
  private mapTriggerType(triggerType: string): number {
    switch (triggerType) {
      case 'webhook':
      case 'http-webhook':
        return TriggerType.HTTP_WEBHOOK;
      case 'on-chain-event':
        return TriggerType.ON_CHAIN_EVENT;
      case 'price-threshold':
        return TriggerType.PRICE_THRESHOLD;
      case 'time-based':
        return TriggerType.TIME_BASED;
      default:
        return TriggerType.CUSTOM;
    }
  }

  // Encode trigger data for smart contract
  private encodeTriggerData(triggerType: string, config: any): string {
    switch (triggerType) {
      case 'price-threshold':
        return ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'uint256'],
          [config.token || 'ETH', ethers.parseEther(config.threshold?.toString() || '1')]
        );
      
      case 'on-chain-event':
        return ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'bytes32'],
          [config.contractAddress || ethers.ZeroAddress, config.eventSignature || ethers.ZeroHash]
        );
      
      case 'webhook':
        return ethers.AbiCoder.defaultAbiCoder().encode(
          ['string'],
          [config.url || '']
        );
      
      case 'time-based':
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

  // Store function metadata for orchestrator
  private async storeFunctionMetadata(functionId: number, functionData: FunctionDeploymentData) {
    // In production, this would store in a database or IPFS
    // For demo, we'll store in localStorage
    const metadata = {
      functionId,
      name: functionData.name,
      description: functionData.description,
      code: functionData.code,
      runtime: functionData.runtime,
      triggerType: functionData.triggerType,
      triggerConfig: functionData.triggerConfig,
      webhookUrl: functionData.webhookUrl,
      deployedAt: new Date().toISOString()
    };

    const existingFunctions = JSON.parse(localStorage.getItem('monadFaasFunctions') || '[]');
    existingFunctions.push(metadata);
    localStorage.setItem('monadFaasFunctions', JSON.stringify(existingFunctions));
    
    console.log('Function metadata stored:', metadata);
  }

  // Get deployed functions
  getDeployedFunctions() {
    return JSON.parse(localStorage.getItem('monadFaasFunctions') || '[]');
  }

  // Test function execution (simulate trigger)
  async testFunction(functionId: number, triggerId: number, testData: any = {}) {
    try {
      console.log('Testing function execution:', { functionId, triggerId });

      const contextData = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'uint256', 'string'],
        [
          'test',
          Math.floor(Date.now() / 1000),
          JSON.stringify(testData)
        ]
      );

      const tx = await this.registry.fireTrigger(triggerId, contextData, {
        gasLimit: 150000,
        gasPrice: CONFIG.gasPrice
      });

      const receipt = await tx.wait();
      
      // Record execution metrics
      MetricsService.recordExecution({
        functionId,
        triggerId,
        txHash: tx.hash,
        timestamp: Date.now(),
        gasUsed: receipt.gasUsed,
        success: receipt.status === 1,
        executionTime: 1000 // Mock execution time
      });

      return {
        success: true,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('Function test failed:', error);
      
      // Record failed execution
      MetricsService.recordExecution({
        functionId,
        triggerId,
        txHash: '',
        timestamp: Date.now(),
        gasUsed: BigInt(0),
        success: false,
        executionTime: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
    }
  }
}

const deploymentServiceInstance = new DeploymentService();
export default deploymentServiceInstance;
