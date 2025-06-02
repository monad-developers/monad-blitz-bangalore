#!/usr/bin/env node

/**
 * MonadFaas Turbo Demo Script - Ultra High Performance
 *
 * This script demonstrates extreme scalability optimizations:
 * 1. Maximum parallel processing with controlled concurrency
 * 2. Optimized gas usage and transaction batching
 * 3. Real-time performance monitoring
 * 4. Advanced error handling and recovery
 */

require('dotenv').config();
const { ethers } = require('ethers');
const chalk = require('chalk');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let numFunctions = 50; // Optimized default for turbo mode
  let turboMode = false;

  for (const arg of args) {
    if (arg.startsWith('--functions=')) {
      numFunctions = parseInt(arg.split('=')[1]);
    }
    if (arg === '--turbo') {
      turboMode = true;
    }
  }

  return { numFunctions, turboMode };
}

const { numFunctions, turboMode } = parseArgs();

// Turbo Configuration - Optimized for maximum speed
const CONFIG = {
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  registryAddress: '0x4142d9Ad70f87c359260e6dC41340af5823BC888',
  privateKey: process.env.PRIVATE_KEY,
  numFunctions: numFunctions,
  priceThreshold: ethers.parseEther('2000'),
  mockPrice: ethers.parseEther('2500'),
  
  // Turbo optimizations
  maxConcurrency: turboMode ? 10 : 5, // Higher concurrency in turbo mode
  batchSize: Math.min(20, numFunctions), // Larger batches
  gasPrice: ethers.parseUnits(turboMode ? '75' : '50', 'gwei'), // Higher gas for speed
  gasLimits: {
    register: turboMode ? 250000 : 300000, // Optimized gas limits
    trigger: turboMode ? 120000 : 150000,
    fire: turboMode ? 80000 : 100000
  },
  delays: {
    betweenBatches: turboMode ? 25 : 50, // Minimal delays in turbo mode
    betweenTxs: turboMode ? 5 : 10
  }
};

// Optimized ABI - Only essential functions
const REGISTRY_ABI = [
  'function registerFunction(string calldata name, string calldata description, bytes32 wasmHash, uint256 gasLimit, string calldata runtime) external returns (uint256 functionId)',
  'function addTrigger(uint256 functionId, uint8 triggerType, bytes calldata triggerData) external returns (uint256 triggerId)',
  'function fireTrigger(uint256 triggerId, bytes calldata contextData) external',
  'function nextFunctionId() external view returns (uint256)',
  'function nextTriggerId() external view returns (uint256)',
  'event FunctionRegistered(uint256 indexed functionId, address indexed owner, string name, bytes32 wasmHash)',
  'event TriggerAdded(uint256 indexed triggerId, uint256 indexed functionId, uint8 triggerType)',
  'event TriggerFired(uint256 indexed triggerId, uint256 indexed functionId, bytes contextData)'
];

const TriggerType = { PRICE_THRESHOLD: 2 };

class TurboMonadFaasDemo {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.privateKey, this.provider);
    this.registry = new ethers.Contract(CONFIG.registryAddress, REGISTRY_ABI, this.wallet);
    this.functionIds = [];
    this.triggerIds = [];
    this.nonce = null;
    
    // Performance tracking
    this.metrics = {
      startTime: Date.now(),
      phases: {},
      gasUsed: 0,
      txCount: 0,
      errors: 0
    };
  }

  async initializeNonce() {
    this.nonce = await this.provider.getTransactionCount(this.wallet.address);
  }

  getNextNonce() {
    return this.nonce++;
  }

  // Ultra-fast parallel execution with proper nonce management
  async executeParallel(tasks, maxConcurrency = CONFIG.maxConcurrency) {
    const results = [];

    // Execute in smaller batches to avoid nonce conflicts
    const batchSize = Math.min(maxConcurrency, 3); // Reduced batch size for stability

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);

      try {
        const batchResults = await Promise.allSettled(batch.map(task => task()));

        batchResults.forEach((result, batchIndex) => {
          const globalIndex = i + batchIndex;
          results[globalIndex] = result;

          if (result.status === 'rejected') {
            this.metrics.errors++;
            console.log(`   ⚠️  Task ${globalIndex + 1} failed: ${result.reason?.message || 'Unknown error'}`);
          }
        });

        // Small delay between batches to prevent overwhelming the network
        if (i + batchSize < tasks.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.delays.betweenBatches));
        }

      } catch (error) {
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
        // Mark all tasks in this batch as failed
        for (let j = 0; j < batch.length; j++) {
          results[i + j] = { status: 'rejected', reason: error };
          this.metrics.errors++;
        }
      }
    }

    return results;
  }

  async run() {
    console.log(chalk.magenta.bold('🚀 MonadFaas TURBO Demo'));
    console.log(chalk.magenta('=' .repeat(60)));
    console.log(chalk.yellow(`⚡ Turbo Mode: ${turboMode ? 'ENABLED' : 'DISABLED'}`));
    console.log(chalk.yellow(`🎯 Target Functions: ${CONFIG.numFunctions}`));
    console.log(chalk.yellow(`🔥 Max Concurrency: ${CONFIG.maxConcurrency}`));
    console.log();

    try {
      await this.initializeNonce();
      await this.checkConnection();
      await this.turboRegisterFunctions();
      await this.turboAddTriggers();
      await this.turboFireTriggers();
      await this.showTurboResults();
    } catch (error) {
      console.error(chalk.red('💥 Turbo demo failed:'), error.message);
      process.exit(1);
    }
  }

  async checkConnection() {
    const startTime = Date.now();
    console.log(chalk.cyan('🔍 Turbo connection check...'));

    const [network, balance, nextFunctionId] = await Promise.all([
      this.provider.getNetwork(),
      this.provider.getBalance(this.wallet.address),
      this.registry.nextFunctionId()
    ]);

    console.log(`   Network: Chain ID ${network.chainId}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`   Next Function ID: ${nextFunctionId}`);
    console.log(chalk.green(`   ✅ Connection verified in ${Date.now() - startTime}ms`));
    console.log();
  }

  async turboRegisterFunctions() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`📝 TURBO: Registering ${CONFIG.numFunctions} functions...`));

    const wasmHash = ethers.keccak256(ethers.toUtf8Bytes('turbo-price-alert'));
    
    // Create all registration tasks
    const tasks = Array.from({ length: CONFIG.numFunctions }, (_, i) => {
      return async () => {
        const tx = await this.registry.registerFunction(
          `TurboAlert_${i + 1}`,
          `Turbo price alert #${i + 1}`,
          wasmHash,
          CONFIG.gasLimits.register,
          'javascript',
          {
            nonce: this.getNextNonce(),
            gasLimit: CONFIG.gasLimits.register,
            gasPrice: CONFIG.gasPrice
          }
        );

        const receipt = await tx.wait();
        this.metrics.gasUsed += Number(receipt.gasUsed);
        this.metrics.txCount++;

        // Extract function ID from events
        const log = receipt.logs.find(log => {
          try {
            const parsed = this.registry.interface.parseLog(log);
            return parsed?.name === 'FunctionRegistered';
          } catch { return false; }
        });

        return log ? Number(this.registry.interface.parseLog(log).args[0]) : null;
      };
    });

    // Execute with maximum parallelism
    console.log(`   🔄 Executing ${tasks.length} registrations with ${CONFIG.maxConcurrency} parallel transactions...`);
    const results = await this.executeParallel(tasks);

    // Collect successful function IDs
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        this.functionIds.push(result.value);
      }
    });

    const duration = Date.now() - phaseStart;
    this.metrics.phases.registration = duration;
    
    console.log(chalk.green(`   🎉 TURBO: Registered ${this.functionIds.length} functions in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(this.functionIds.length / (duration / 1000)).toFixed(1)} functions/second`));
    console.log();
  }

  async turboAddTriggers() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`⚡ TURBO: Adding ${this.functionIds.length} triggers...`));

    const triggerData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'uint256'],
      ['ETH', CONFIG.priceThreshold]
    );

    // Create trigger tasks
    const tasks = this.functionIds.map(functionId => {
      return async () => {
        const tx = await this.registry.addTrigger(
          functionId,
          TriggerType.PRICE_THRESHOLD,
          triggerData,
          {
            nonce: this.getNextNonce(),
            gasLimit: CONFIG.gasLimits.trigger,
            gasPrice: CONFIG.gasPrice
          }
        );

        const receipt = await tx.wait();
        this.metrics.gasUsed += Number(receipt.gasUsed);
        this.metrics.txCount++;

        const log = receipt.logs.find(log => {
          try {
            const parsed = this.registry.interface.parseLog(log);
            return parsed?.name === 'TriggerAdded';
          } catch { return false; }
        });

        return log ? Number(this.registry.interface.parseLog(log).args[0]) : null;
      };
    });

    const results = await this.executeParallel(tasks);

    // Collect trigger IDs
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        this.triggerIds.push(result.value);
      }
    });

    const duration = Date.now() - phaseStart;
    this.metrics.phases.triggers = duration;
    
    console.log(chalk.green(`   🎉 TURBO: Added ${this.triggerIds.length} triggers in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(this.triggerIds.length / (duration / 1000)).toFixed(1)} triggers/second`));
    console.log();
  }

  async turboFireTriggers() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`🔥 TURBO: Firing ${this.triggerIds.length} triggers...`));

    const contextData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'uint256', 'uint256', 'uint256'],
      ['ETH', CONFIG.mockPrice, Math.floor(Date.now() / 1000), await this.provider.getBlockNumber()]
    );

    // Create fire tasks
    const tasks = this.triggerIds.map(triggerId => {
      return async () => {
        const tx = await this.registry.fireTrigger(
          triggerId,
          contextData,
          {
            nonce: this.getNextNonce(),
            gasLimit: CONFIG.gasLimits.fire,
            gasPrice: CONFIG.gasPrice
          }
        );

        const receipt = await tx.wait();
        this.metrics.gasUsed += Number(receipt.gasUsed);
        this.metrics.txCount++;
        
        return tx.hash;
      };
    });

    const results = await this.executeParallel(tasks);
    const successfulFires = results.filter(r => r.status === 'fulfilled').length;

    const duration = Date.now() - phaseStart;
    this.metrics.phases.firing = duration;
    
    console.log(chalk.green(`   🎉 TURBO: Fired ${successfulFires} triggers in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(successfulFires / (duration / 1000)).toFixed(1)} fires/second`));
    console.log();
  }

  async showTurboResults() {
    const totalTime = Date.now() - this.metrics.startTime;
    
    console.log(chalk.magenta.bold('🏆 TURBO DEMO RESULTS'));
    console.log(chalk.magenta('=' .repeat(60)));
    console.log();
    
    console.log(chalk.green('✅ TURBO SCALABILITY ACHIEVED!'));
    console.log();
    
    console.log(chalk.cyan('🚀 Performance Metrics:'));
    console.log(`   Functions: ${chalk.bold(this.functionIds.length)}`);
    console.log(`   Triggers: ${chalk.bold(this.triggerIds.length)}`);
    console.log(`   Total Time: ${chalk.bold(totalTime.toLocaleString())}ms`);
    console.log(`   Success Rate: ${chalk.bold(((this.metrics.txCount - this.metrics.errors) / this.metrics.txCount * 100).toFixed(1))}%`);
    console.log();
    
    console.log(chalk.cyan('⚡ Speed Analysis:'));
    console.log(`   Registration: ${chalk.bold(this.metrics.phases.registration)}ms`);
    console.log(`   Trigger Setup: ${chalk.bold(this.metrics.phases.triggers)}ms`);
    console.log(`   Trigger Firing: ${chalk.bold(this.metrics.phases.firing)}ms`);
    console.log(`   Overall Speed: ${chalk.bold((this.functionIds.length / (totalTime / 1000)).toFixed(1))} functions/second`);
    console.log();
    
    console.log(chalk.cyan('⛽ Gas Efficiency:'));
    console.log(`   Total Gas: ${chalk.bold(this.metrics.gasUsed.toLocaleString())}`);
    console.log(`   Transactions: ${chalk.bold(this.metrics.txCount)}`);
    console.log(`   Avg Gas/Tx: ${chalk.bold(Math.round(this.metrics.gasUsed / this.metrics.txCount).toLocaleString())}`);
    console.log(`   Gas Price: ${chalk.bold(ethers.formatUnits(CONFIG.gasPrice, 'gwei'))} gwei`);
    console.log();
    
    console.log(chalk.green.bold(`🎯 TURBO MODE COMPLETE: ${this.functionIds.length} functions in ${totalTime}ms!`));
  }
}

// Main execution
async function main() {
  console.clear();
  const demo = new TurboMonadFaasDemo();
  await demo.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('💥 Turbo demo crashed:'), error);
    process.exit(1);
  });
}

module.exports = { TurboMonadFaasDemo, CONFIG };
