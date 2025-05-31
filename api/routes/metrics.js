/**
 * Real-time Metrics API Routes
 * 
 * Provides comprehensive metrics collection, analysis, and reporting
 */

const express = require('express');
const EtherscanService = require('../services/EtherscanService');
const chalk = require('chalk');
const router = express.Router();

// Initialize Etherscan service
const etherscanService = new EtherscanService(10143);

// In-memory metrics storage (in production, use Redis or database)
let metricsStore = {
  execution: {
    totalFunctions: 0,
    totalTriggers: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalGasUsed: BigInt(0),
    totalCostETH: 0,
    averageExecutionTime: 0,
    successRate: 0,
    failureRate: 0
  },
  gas: {
    totalGasUsed: BigInt(0),
    totalCostETH: 0,
    avgGasPerFunction: 0,
    avgGasPerTrigger: 0,
    avgGasPerExecution: 0,
    gasPrice: BigInt(75000000000) // 75 gwei default
  },
  timing: {
    totalTime: 0,
    avgTimePerFunction: 0,
    avgTimePerTrigger: 0,
    avgTimePerExecution: 0,
    registrationTime: 0,
    triggerSetupTime: 0,
    executionTime: 0
  },
  recentExecutions: [],
  transactions: [],
  lastUpdated: Date.now(),
  startTime: Date.now()
};

// Helper function to serialize BigInt values
function serializeMetrics(metrics) {
  return {
    ...metrics,
    execution: {
      ...metrics.execution,
      totalGasUsed: metrics.execution.totalGasUsed.toString()
    },
    gas: {
      ...metrics.gas,
      totalGasUsed: metrics.gas.totalGasUsed.toString(),
      gasPrice: metrics.gas.gasPrice.toString()
    }
  };
}

// Helper function to calculate derived metrics
function calculateDerivedMetrics() {
  const { execution, gas, timing, transactions } = metricsStore;
  
  // Calculate averages
  if (execution.totalFunctions > 0) {
    gas.avgGasPerFunction = Number(gas.totalGasUsed) / execution.totalFunctions;
    timing.avgTimePerFunction = timing.registrationTime / execution.totalFunctions;
  }
  
  if (execution.totalTriggers > 0) {
    gas.avgGasPerTrigger = Number(gas.totalGasUsed) / execution.totalTriggers;
    timing.avgTimePerTrigger = timing.triggerSetupTime / execution.totalTriggers;
  }
  
  if (execution.totalExecutions > 0) {
    gas.avgGasPerExecution = Number(gas.totalGasUsed) / execution.totalExecutions;
    timing.avgTimePerExecution = timing.executionTime / execution.totalExecutions;
    execution.successRate = (execution.successfulExecutions / execution.totalExecutions) * 100;
    execution.failureRate = (execution.failedExecutions / execution.totalExecutions) * 100;
  }
  
  // Calculate total cost in ETH
  const gasPriceInETH = Number(gas.gasPrice) / 1e18;
  gas.totalCostETH = Number(gas.totalGasUsed) * gasPriceInETH;
  execution.totalCostETH = gas.totalCostETH;
  
  // Update timing
  timing.totalTime = Date.now() - metricsStore.startTime;
  
  // Keep only recent executions (last 100)
  if (metricsStore.recentExecutions.length > 100) {
    metricsStore.recentExecutions = metricsStore.recentExecutions.slice(-100);
  }
  
  metricsStore.lastUpdated = Date.now();
}

// Get current metrics
router.get('/', (req, res) => {
  calculateDerivedMetrics();
  
  res.json({
    success: true,
    data: serializeMetrics(metricsStore)
  });
});

// Get detailed analytics
router.get('/analytics', async (req, res) => {
  try {
    calculateDerivedMetrics();
    
    // Get gas statistics
    const gasStats = await etherscanService.getGasStats();
    
    // Analyze transaction efficiency
    const transactionAnalysis = etherscanService.analyzeGasEfficiency(metricsStore.transactions);
    
    // Calculate performance metrics
    const performanceMetrics = {
      throughput: {
        functionsPerSecond: metricsStore.execution.totalFunctions / (metricsStore.timing.totalTime / 1000),
        triggersPerSecond: metricsStore.execution.totalTriggers / (metricsStore.timing.totalTime / 1000),
        executionsPerSecond: metricsStore.execution.totalExecutions / (metricsStore.timing.totalTime / 1000)
      },
      efficiency: {
        gasEfficiency: transactionAnalysis?.averageGasUsed || 0,
        costEfficiency: metricsStore.gas.totalCostETH,
        timeEfficiency: metricsStore.timing.avgTimePerExecution
      },
      reliability: {
        successRate: metricsStore.execution.successRate,
        failureRate: metricsStore.execution.failureRate,
        uptime: 100 // Mock uptime
      }
    };
    
    res.json({
      success: true,
      data: {
        metrics: serializeMetrics(metricsStore),
        gasStats,
        transactionAnalysis,
        performanceMetrics,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Analytics generation failed:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Record a new execution
router.post('/execution', (req, res) => {
  try {
    const {
      functionId,
      triggerId,
      txHash,
      gasUsed = 0,
      success = true,
      executionTime = 0,
      phase = 'execution'
    } = req.body;
    
    // Update execution metrics
    metricsStore.execution.totalExecutions++;
    if (success) {
      metricsStore.execution.successfulExecutions++;
    } else {
      metricsStore.execution.failedExecutions++;
    }
    
    // Update gas metrics
    const gasUsedBigInt = BigInt(gasUsed);
    metricsStore.gas.totalGasUsed += gasUsedBigInt;
    metricsStore.execution.totalGasUsed += gasUsedBigInt;
    
    // Update timing metrics
    metricsStore.timing.executionTime += executionTime;
    
    // Add to recent executions
    const execution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      functionId,
      triggerId,
      txHash,
      gasUsed,
      success,
      executionTime,
      timestamp: Date.now(),
      phase
    };
    
    metricsStore.recentExecutions.push(execution);
    
    // Add to transactions for analysis
    if (txHash) {
      metricsStore.transactions.push({
        hash: txHash,
        gasUsed,
        gasPrice: Number(metricsStore.gas.gasPrice),
        gasCost: gasUsed * Number(metricsStore.gas.gasPrice),
        gasCostETH: (gasUsed * Number(metricsStore.gas.gasPrice)) / 1e18,
        status: success ? 'success' : 'failed',
        timestamp: Date.now()
      });
    }
    
    calculateDerivedMetrics();
    
    console.log(chalk.green(`📊 Recorded execution: ${success ? 'SUCCESS' : 'FAILED'} - Gas: ${gasUsed}`));
    
    res.json({
      success: true,
      data: {
        executionId: execution.id,
        metrics: serializeMetrics(metricsStore)
      }
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to record execution:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Record function registration
router.post('/function', (req, res) => {
  try {
    const { gasUsed = 0, executionTime = 0 } = req.body;
    
    metricsStore.execution.totalFunctions++;
    metricsStore.gas.totalGasUsed += BigInt(gasUsed);
    metricsStore.execution.totalGasUsed += BigInt(gasUsed);
    metricsStore.timing.registrationTime += executionTime;
    
    calculateDerivedMetrics();
    
    console.log(chalk.green(`📊 Recorded function registration - Gas: ${gasUsed}`));
    
    res.json({
      success: true,
      data: serializeMetrics(metricsStore)
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to record function:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Record trigger creation
router.post('/trigger', (req, res) => {
  try {
    const { gasUsed = 0, executionTime = 0 } = req.body;
    
    metricsStore.execution.totalTriggers++;
    metricsStore.gas.totalGasUsed += BigInt(gasUsed);
    metricsStore.execution.totalGasUsed += BigInt(gasUsed);
    metricsStore.timing.triggerSetupTime += executionTime;
    
    calculateDerivedMetrics();
    
    console.log(chalk.green(`📊 Recorded trigger creation - Gas: ${gasUsed}`));
    
    res.json({
      success: true,
      data: serializeMetrics(metricsStore)
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to record trigger:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction details with Etherscan data
router.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // Get transaction details from Etherscan
    const [transaction, receipt] = await Promise.all([
      etherscanService.getTransaction(txHash),
      etherscanService.getTransactionReceipt(txHash)
    ]);
    
    res.json({
      success: true,
      data: {
        transaction,
        receipt,
        explorerUrl: etherscanService.getExplorerUrl(txHash),
        fetchedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to fetch transaction:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reset all metrics
router.post('/reset', (req, res) => {
  metricsStore = {
    execution: {
      totalFunctions: 0,
      totalTriggers: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalGasUsed: BigInt(0),
      totalCostETH: 0,
      averageExecutionTime: 0,
      successRate: 0,
      failureRate: 0
    },
    gas: {
      totalGasUsed: BigInt(0),
      totalCostETH: 0,
      avgGasPerFunction: 0,
      avgGasPerTrigger: 0,
      avgGasPerExecution: 0,
      gasPrice: BigInt(75000000000)
    },
    timing: {
      totalTime: 0,
      avgTimePerFunction: 0,
      avgTimePerTrigger: 0,
      avgTimePerExecution: 0,
      registrationTime: 0,
      triggerSetupTime: 0,
      executionTime: 0
    },
    recentExecutions: [],
    transactions: [],
    lastUpdated: Date.now(),
    startTime: Date.now()
  };
  
  console.log(chalk.yellow('🔄 Metrics reset'));
  
  res.json({
    success: true,
    message: 'Metrics reset successfully',
    data: serializeMetrics(metricsStore)
  });
});

// Export metrics data
router.get('/export', (req, res) => {
  calculateDerivedMetrics();
  
  const exportData = {
    timestamp: new Date().toISOString(),
    metrics: serializeMetrics(metricsStore),
    summary: {
      totalFunctions: metricsStore.execution.totalFunctions,
      totalExecutions: metricsStore.execution.totalExecutions,
      successRate: metricsStore.execution.successRate,
      totalCostETH: metricsStore.gas.totalCostETH,
      totalGasUsed: metricsStore.gas.totalGasUsed.toString(),
      averageExecutionTime: metricsStore.timing.avgTimePerExecution
    },
    recentExecutions: metricsStore.recentExecutions,
    transactions: metricsStore.transactions
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="monadfaas-metrics-${Date.now()}.json"`);
  res.json(exportData);
});

module.exports = router;
