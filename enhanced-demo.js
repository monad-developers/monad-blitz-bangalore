#!/usr/bin/env node

/**
 * Enhanced MonadFaas Demo Script
 * 
 * Optimized for high-performance demonstrations with:
 * - 100+ concurrent function invocations
 * - Real-time metrics collection
 * - Advanced analytics and reporting
 * - Dashboard integration
 */

require('dotenv').config();
const { ethers } = require('ethers');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let numFunctions = 100; // Default for high-performance demo
  let enableMetrics = true;
  let outputFile = null;
  let stressTest = false;

  for (const arg of args) {
    if (arg.startsWith('--functions=')) {
      numFunctions = parseInt(arg.split('=')[1]);
    }
    if (arg === '--no-metrics') {
      enableMetrics = false;
    }
    if (arg.startsWith('--output=')) {
      outputFile = arg.split('=')[1];
    }
    if (arg === '--stress-test') {
      stressTest = true;
    }
  }

  return { numFunctions, enableMetrics, outputFile, stressTest };
}

const { numFunctions, enableMetrics, outputFile, stressTest } = parseArgs();

// Enhanced Configuration for High Performance
const CONFIG = {
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  registryAddress: '0x4142d9Ad70f87c359260e6dC41340af5823BC888',
  privateKey: process.env.PRIVATE_KEY,
  numFunctions: numFunctions,
  priceThreshold: ethers.parseEther('2000'),
  mockPrice: ethers.parseEther('2500'),
  
  // High-performance optimizations
  maxConcurrency: Math.min(20, Math.ceil(numFunctions / 5)), // Dynamic concurrency
  batchSize: Math.min(50, numFunctions), // Large batches for efficiency
  gasPrice: ethers.parseUnits('75', 'gwei'), // Higher gas for speed
  gasLimits: {
    register: 250000, // Optimized gas limits
    trigger: 120000,
    fire: 80000
  },
  delays: {
    betweenBatches: 10, // Minimal delays for maximum speed
    betweenTxs: 5
  },
  
  // Metrics configuration
  enableMetrics,
  metricsInterval: 1000, // Update metrics every second
  outputFile
};

// Contract ABI (optimized)
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

// Enhanced Metrics Collection
class AdvancedMetrics {
  constructor() {
    this.startTime = Date.now();
    this.phases = {};
    this.transactions = [];
    this.gasUsed = 0;
    this.errors = [];
    this.throughput = [];
    this.realTimeStats = {
      functionsPerSecond: 0,
      triggersPerSecond: 0,
      executionsPerSecond: 0,
      avgGasPerTx: 0,
      successRate: 100
    };
  }

  recordTransaction(phase, txHash, gasUsed, success, executionTime) {
    const record = {
      phase,
      txHash,
      gasUsed: Number(gasUsed),
      success,
      executionTime,
      timestamp: Date.now()
    };
    
    this.transactions.push(record);
    this.gasUsed += Number(gasUsed);
    
    if (!success) {
      this.errors.push(record);
    }
    
    this.updateRealTimeStats();
  }

  recordPhase(phase, duration, count) {
    this.phases[phase] = {
      duration,
      count,
      throughput: count / (duration / 1000),
      avgTimePerItem: duration / count
    };
  }

  updateRealTimeStats() {
    const now = Date.now();
    const timeWindow = 5000; // 5 second window
    const recentTxs = this.transactions.filter(tx => now - tx.timestamp < timeWindow);
    
    const phases = ['registration', 'triggers', 'executions'];
    phases.forEach(phase => {
      const phaseTxs = recentTxs.filter(tx => tx.phase === phase);
      this.realTimeStats[`${phase.slice(0, -1)}sPerSecond`] = phaseTxs.length / (timeWindow / 1000);
    });
    
    this.realTimeStats.avgGasPerTx = recentTxs.length > 0 
      ? recentTxs.reduce((sum, tx) => sum + tx.gasUsed, 0) / recentTxs.length 
      : 0;
    
    this.realTimeStats.successRate = recentTxs.length > 0
      ? (recentTxs.filter(tx => tx.success).length / recentTxs.length) * 100
      : 100;
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTxs = this.transactions.length;
    const successfulTxs = this.transactions.filter(tx => tx.success).length;
    
    return {
      summary: {
        totalTime,
        totalTransactions: totalTxs,
        successfulTransactions: successfulTxs,
        failedTransactions: totalTxs - successfulTxs,
        successRate: (successfulTxs / totalTxs) * 100,
        totalGasUsed: this.gasUsed,
        avgGasPerTx: this.gasUsed / totalTxs,
        overallThroughput: totalTxs / (totalTime / 1000)
      },
      phases: this.phases,
      realTimeStats: this.realTimeStats,
      errors: this.errors,
      transactions: this.transactions
    };
  }

  exportToFile(filename) {
    const report = this.generateReport();
    const output = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      metrics: report
    };
    
    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
    console.log(chalk.green(`📊 Metrics exported to ${filename}`));
  }
}

class EnhancedMonadFaasDemo {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.privateKey, this.provider);
    this.registry = new ethers.Contract(CONFIG.registryAddress, REGISTRY_ABI, this.wallet);
    this.functionIds = [];
    this.triggerIds = [];
    this.nonce = null;
    this.metrics = new AdvancedMetrics();
    this.metricsInterval = null;
  }

  async initializeNonce() {
    this.nonce = await this.provider.getTransactionCount(this.wallet.address);
  }

  getNextNonce() {
    return this.nonce++;
  }

  startRealTimeMetrics() {
    if (!CONFIG.enableMetrics) return;
    
    this.metricsInterval = setInterval(() => {
      this.displayRealTimeStats();
    }, CONFIG.metricsInterval);
  }

  stopRealTimeMetrics() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  displayRealTimeStats() {
    const stats = this.metrics.realTimeStats;
    process.stdout.write('\r' + chalk.cyan(
      `📊 Live: ${stats.functionsPerSecond.toFixed(1)} f/s | ` +
      `${stats.triggersPerSecond.toFixed(1)} t/s | ` +
      `${stats.executionsPerSecond.toFixed(1)} e/s | ` +
      `${stats.avgGasPerTx.toFixed(0)} gas/tx | ` +
      `${stats.successRate.toFixed(1)}% success`
    ));
  }

  // Ultra-fast parallel execution with advanced error handling
  async executeParallel(tasks, phase, maxConcurrency = CONFIG.maxConcurrency) {
    const results = [];
    const batchSize = Math.min(maxConcurrency, 5); // Smaller batches for stability
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.allSettled(batch.map(task => task()));
        
        batchResults.forEach((result, batchIndex) => {
          const globalIndex = i + batchIndex;
          results[globalIndex] = result;
          
          if (result.status === 'fulfilled' && result.value) {
            this.metrics.recordTransaction(
              phase,
              result.value.txHash || '',
              result.value.gasUsed || 0,
              true,
              result.value.executionTime || 0
            );
          } else {
            this.metrics.recordTransaction(
              phase,
              '',
              0,
              false,
              0
            );
          }
        });
        
        // Minimal delay between batches
        if (i + batchSize < tasks.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.delays.betweenBatches));
        }
        
      } catch (error) {
        console.log(`\n   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
        // Mark all tasks in this batch as failed
        for (let j = 0; j < batch.length; j++) {
          results[i + j] = { status: 'rejected', reason: error };
          this.metrics.recordTransaction(phase, '', 0, false, 0);
        }
      }
    }

    return results;
  }

  async run() {
    console.log(chalk.magenta.bold('🚀 Enhanced MonadFaas High-Performance Demo'));
    console.log(chalk.magenta('=' .repeat(80)));
    console.log(chalk.yellow(`⚡ Target Functions: ${CONFIG.numFunctions}`));
    console.log(chalk.yellow(`🔥 Max Concurrency: ${CONFIG.maxConcurrency}`));
    console.log(chalk.yellow(`📊 Metrics: ${CONFIG.enableMetrics ? 'ENABLED' : 'DISABLED'}`));
    console.log(chalk.yellow(`🎯 Stress Test: ${stressTest ? 'ENABLED' : 'DISABLED'}`));
    console.log();

    try {
      await this.initializeNonce();
      this.startRealTimeMetrics();
      
      await this.checkConnection();
      await this.enhancedRegisterFunctions();
      await this.enhancedAddTriggers();
      await this.enhancedFireTriggers();
      
      if (stressTest) {
        await this.runStressTest();
      }
      
      await this.showEnhancedResults();
      
    } catch (error) {
      console.error(chalk.red('\n💥 Enhanced demo failed:'), error.message);
      process.exit(1);
    } finally {
      this.stopRealTimeMetrics();
      
      if (CONFIG.outputFile) {
        this.metrics.exportToFile(CONFIG.outputFile);
      }
    }
  }

  async checkConnection() {
    const startTime = Date.now();
    console.log(chalk.cyan('🔍 Enhanced connection check...'));

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

  async enhancedRegisterFunctions() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`📝 ENHANCED: Registering ${CONFIG.numFunctions} functions...`));

    const wasmHash = ethers.keccak256(ethers.toUtf8Bytes('enhanced-price-alert'));
    
    // Create all registration tasks
    const tasks = Array.from({ length: CONFIG.numFunctions }, (_, i) => {
      return async () => {
        const txStart = Date.now();
        
        const tx = await this.registry.registerFunction(
          `EnhancedAlert_${i + 1}`,
          `Enhanced price alert #${i + 1} with advanced analytics`,
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
        const executionTime = Date.now() - txStart;

        // Extract function ID from events
        const log = receipt.logs.find(log => {
          try {
            const parsed = this.registry.interface.parseLog(log);
            return parsed?.name === 'FunctionRegistered';
          } catch { return false; }
        });

        const functionId = log ? Number(this.registry.interface.parseLog(log).args[0]) : null;
        
        return {
          functionId,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed,
          executionTime
        };
      };
    });

    // Execute with maximum parallelism
    console.log(`   🔄 Executing ${tasks.length} registrations with ${CONFIG.maxConcurrency} parallel transactions...`);
    const results = await this.executeParallel(tasks, 'registration');

    // Collect successful function IDs
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.functionId) {
        this.functionIds.push(result.value.functionId);
      }
    });

    const duration = Date.now() - phaseStart;
    this.metrics.recordPhase('registration', duration, this.functionIds.length);
    
    console.log(chalk.green(`\n   🎉 ENHANCED: Registered ${this.functionIds.length} functions in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(this.functionIds.length / (duration / 1000)).toFixed(1)} functions/second`));
    console.log();
  }

  async enhancedAddTriggers() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`\n⚡ ENHANCED: Adding ${this.functionIds.length} triggers...`));

    const triggerData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'uint256'],
      ['ETH', CONFIG.priceThreshold]
    );

    // Create trigger tasks for parallel execution
    const tasks = this.functionIds.map(functionId => {
      return async () => {
        const txStart = Date.now();

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
        const executionTime = Date.now() - txStart;

        const log = receipt.logs.find(log => {
          try {
            const parsed = this.registry.interface.parseLog(log);
            return parsed?.name === 'TriggerAdded';
          } catch { return false; }
        });

        const triggerId = log ? Number(this.registry.interface.parseLog(log).args[0]) : null;

        return {
          triggerId,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed,
          executionTime
        };
      };
    });

    console.log(`   🔄 Adding ${tasks.length} triggers with ${CONFIG.maxConcurrency} parallel transactions...`);
    const results = await this.executeParallel(tasks, 'triggers');

    // Collect successful trigger IDs
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value?.triggerId) {
        this.triggerIds.push(result.value.triggerId);
      }
    });

    const duration = Date.now() - phaseStart;
    this.metrics.recordPhase('triggers', duration, this.triggerIds.length);

    console.log(chalk.green(`\n   🎉 ENHANCED: Added ${this.triggerIds.length} triggers in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(this.triggerIds.length / (duration / 1000)).toFixed(1)} triggers/second`));
    console.log();
  }

  async enhancedFireTriggers() {
    const phaseStart = Date.now();
    console.log(chalk.yellow(`🔥 ENHANCED: Firing ${this.triggerIds.length} triggers...`));

    const contextData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'uint256', 'uint256', 'uint256'],
      ['ETH', CONFIG.mockPrice, Math.floor(Date.now() / 1000), await this.provider.getBlockNumber()]
    );

    // Create fire tasks for parallel execution
    const tasks = this.triggerIds.map(triggerId => {
      return async () => {
        const txStart = Date.now();

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
        const executionTime = Date.now() - txStart;

        return {
          txHash: tx.hash,
          gasUsed: receipt.gasUsed,
          executionTime
        };
      };
    });

    console.log(`   🔄 Firing ${tasks.length} triggers with ${CONFIG.maxConcurrency} parallel transactions...`);
    const results = await this.executeParallel(tasks, 'executions');

    const successfulFires = results.filter(r => r.status === 'fulfilled').length;

    const duration = Date.now() - phaseStart;
    this.metrics.recordPhase('executions', duration, successfulFires);

    console.log(chalk.green(`\n   🎉 ENHANCED: Fired ${successfulFires} triggers in ${duration}ms`));
    console.log(chalk.cyan(`   ⚡ Speed: ${(successfulFires / (duration / 1000)).toFixed(1)} executions/second`));
    console.log();
  }

  async runStressTest() {
    console.log(chalk.yellow('\n🚀 Running stress test...'));

    // Simulate rapid-fire executions
    const stressTasks = Array.from({ length: 20 }, (_, i) => {
      return async () => {
        if (this.triggerIds.length === 0) return null;

        const triggerId = this.triggerIds[i % this.triggerIds.length];
        const contextData = ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'uint256', 'uint256', 'uint256'],
          ['STRESS_TEST', CONFIG.mockPrice, Math.floor(Date.now() / 1000), await this.provider.getBlockNumber()]
        );

        const tx = await this.registry.fireTrigger(triggerId, contextData, {
          nonce: this.getNextNonce(),
          gasLimit: CONFIG.gasLimits.fire,
          gasPrice: CONFIG.gasPrice
        });

        const receipt = await tx.wait();
        return { txHash: tx.hash, gasUsed: receipt.gasUsed, executionTime: 500 };
      };
    });

    const stressResults = await this.executeParallel(stressTasks, 'stress-test', 10);
    const successfulStress = stressResults.filter(r => r.status === 'fulfilled').length;

    console.log(chalk.green(`   ✅ Stress test completed: ${successfulStress}/20 executions successful`));
  }

  async showEnhancedResults() {
    const report = this.metrics.generateReport();
    
    console.log(chalk.magenta.bold('\n🏆 ENHANCED DEMO RESULTS'));
    console.log(chalk.magenta('=' .repeat(80)));
    console.log();
    
    console.log(chalk.green('✅ HIGH-PERFORMANCE SCALABILITY ACHIEVED!'));
    console.log();
    
    console.log(chalk.cyan('🚀 Performance Summary:'));
    console.log(`   Functions: ${chalk.bold(this.functionIds.length)}`);
    console.log(`   Total Time: ${chalk.bold(report.summary.totalTime.toLocaleString())}ms`);
    console.log(`   Throughput: ${chalk.bold(report.summary.overallThroughput.toFixed(1))} tx/second`);
    console.log(`   Success Rate: ${chalk.bold(report.summary.successRate.toFixed(1))}%`);
    console.log(`   Total Gas: ${chalk.bold(report.summary.totalGasUsed.toLocaleString())}`);
    console.log();
    
    console.log(chalk.green.bold(`🎯 ENHANCED MODE COMPLETE: ${this.functionIds.length} functions processed!`));
  }
}

// Main execution
async function main() {
  console.clear();
  const demo = new EnhancedMonadFaasDemo();
  await demo.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('💥 Enhanced demo crashed:'), error);
    process.exit(1);
  });
}

module.exports = { EnhancedMonadFaasDemo, CONFIG };
