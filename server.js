#!/usr/bin/env node

/**
 * MonadFaas Integrated Backend Server
 * 
 * Features:
 * - Express.js API server with WebSocket support
 * - Real-time metrics broadcasting
 * - Function deployment and execution
 * - Etherscan integration
 * - Enhanced demo orchestration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const WebSocket = require('ws');
const path = require('path');
const chalk = require('chalk');

// Import our enhanced demo and services
const { EnhancedMonadFaasDemo } = require('./enhanced-demo');

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Global state for metrics and demo management
let globalMetrics = {
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
    gasPrice: BigInt(0)
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
  lastUpdated: Date.now()
};

let activeDemoInstance = null;
let connectedClients = new Set();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: [`http://localhost:${FRONTEND_PORT}`, 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from dashboard build
app.use(express.static(path.join(__dirname, 'dashboard/build')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log(chalk.green('🔌 Client connected to WebSocket'));
  connectedClients.add(ws);
  
  // Send current metrics immediately
  ws.send(JSON.stringify({
    type: 'metrics_update',
    data: serializeMetrics(globalMetrics)
  }));

  ws.on('close', () => {
    console.log(chalk.yellow('🔌 Client disconnected from WebSocket'));
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(chalk.red('WebSocket error:'), error);
    connectedClients.delete(ws);
  });
});

// Broadcast metrics to all connected clients
function broadcastMetrics(metrics) {
  const message = JSON.stringify({
    type: 'metrics_update',
    data: serializeMetrics(metrics),
    timestamp: Date.now()
  });

  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Serialize BigInt values for JSON
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

// Update global metrics
function updateGlobalMetrics(newMetrics) {
  globalMetrics = { ...globalMetrics, ...newMetrics };
  globalMetrics.lastUpdated = Date.now();
  broadcastMetrics(globalMetrics);
}

// Import API routes
const functionsRouter = require('./api/routes/functions');
const metricsRouter = require('./api/routes/metrics');

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// Mount API routes
app.use('/api/functions', functionsRouter);
app.use('/api/metrics', metricsRouter);

// Legacy metrics endpoints for backward compatibility
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    data: serializeMetrics(globalMetrics)
  });
});

app.post('/api/metrics/reset', (req, res) => {
  globalMetrics = {
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
      gasPrice: BigInt(0)
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
    lastUpdated: Date.now()
  };

  broadcastMetrics(globalMetrics);
  res.json({ success: true, message: 'Metrics reset successfully' });
});

// Demo execution endpoints
app.post('/api/demo/start', async (req, res) => {
  try {
    const { numFunctions = 20, enableMetrics = true, stressTest = false } = req.body;
    
    if (activeDemoInstance) {
      return res.status(400).json({
        success: false,
        error: 'Demo is already running'
      });
    }

    console.log(chalk.cyan(`🚀 Starting demo with ${numFunctions} functions`));
    
    // Create new demo instance
    activeDemoInstance = new EnhancedMonadFaasDemo();
    
    // Override metrics recording to update global state
    const originalRecordTransaction = activeDemoInstance.metrics.recordTransaction;
    activeDemoInstance.metrics.recordTransaction = function(phase, txHash, gasUsed, success, executionTime) {
      // Call original method
      originalRecordTransaction.call(this, phase, txHash, gasUsed, success, executionTime);
      
      // Update global metrics
      updateGlobalMetrics({
        execution: {
          ...globalMetrics.execution,
          totalExecutions: globalMetrics.execution.totalExecutions + 1,
          successfulExecutions: success ? globalMetrics.execution.successfulExecutions + 1 : globalMetrics.execution.successfulExecutions,
          failedExecutions: success ? globalMetrics.execution.failedExecutions : globalMetrics.execution.failedExecutions + 1,
          totalGasUsed: globalMetrics.execution.totalGasUsed + BigInt(gasUsed || 0)
        }
      });
    };

    // Start demo in background
    activeDemoInstance.run().then(() => {
      console.log(chalk.green('✅ Demo completed successfully'));
      activeDemoInstance = null;
    }).catch((error) => {
      console.error(chalk.red('❌ Demo failed:'), error);
      activeDemoInstance = null;
    });

    res.json({
      success: true,
      message: 'Demo started successfully',
      config: { numFunctions, enableMetrics, stressTest }
    });

  } catch (error) {
    console.error(chalk.red('Demo start error:'), error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/demo/stop', (req, res) => {
  if (activeDemoInstance) {
    activeDemoInstance.stopRealTimeMetrics();
    activeDemoInstance = null;
    res.json({ success: true, message: 'Demo stopped successfully' });
  } else {
    res.status(400).json({ success: false, error: 'No active demo to stop' });
  }
});

app.get('/api/demo/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isRunning: !!activeDemoInstance,
      startTime: activeDemoInstance?.metrics?.startTime || null
    }
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(chalk.red('Server error:'), error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
server.listen(PORT, () => {
  console.log(chalk.green.bold('🚀 MonadFaas Server Started!'));
  console.log(chalk.cyan(`📡 API Server: http://localhost:${PORT}`));
  console.log(chalk.cyan(`🌐 Dashboard: http://localhost:${PORT}`));
  console.log(chalk.cyan(`🔌 WebSocket: ws://localhost:${PORT}`));
  console.log(chalk.yellow('📊 Real-time metrics broadcasting enabled'));
  console.log(chalk.magenta('=' .repeat(50)));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('🛑 Received SIGTERM, shutting down gracefully'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});

module.exports = { app, server, wss };
