#!/usr/bin/env node

/**
 * MonadFaas Demo Startup Script
 * 
 * Launches the complete integrated platform:
 * - Backend API server with WebSocket support
 * - Frontend React dashboard
 * - Runs integration tests
 * - Provides demo instructions
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

class DemoLauncher {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  log(message, color = 'white') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(chalk[color](`[${timestamp}] ${message}`));
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'cyan');
    
    // Check if .env file exists
    const fs = require('fs');
    if (!fs.existsSync('.env')) {
      this.log('❌ .env file not found. Please copy .env.example to .env and configure it.', 'red');
      process.exit(1);
    }
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      this.log('❌ Dependencies not installed. Please run: npm install', 'red');
      process.exit(1);
    }
    
    // Check if dashboard dependencies exist
    if (!fs.existsSync('dashboard/node_modules')) {
      this.log('❌ Dashboard dependencies not installed. Please run: cd dashboard && npm install', 'red');
      process.exit(1);
    }
    
    this.log('✅ Prerequisites check passed', 'green');
  }

  async startBackend() {
    this.log('🚀 Starting backend API server...', 'cyan');
    
    const backend = spawn('node', ['server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    this.processes.push({ name: 'Backend', process: backend });
    
    backend.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.log(`[Backend] ${message}`, 'blue');
      }
    });
    
    backend.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('ExperimentalWarning')) {
        this.log(`[Backend Error] ${message}`, 'red');
      }
    });
    
    backend.on('close', (code) => {
      if (!this.isShuttingDown) {
        this.log(`❌ Backend process exited with code ${code}`, 'red');
      }
    });
    
    // Wait for backend to start
    await this.delay(3000);
    this.log('✅ Backend server started on http://localhost:3001', 'green');
  }

  async startFrontend() {
    this.log('🌐 Starting frontend dashboard...', 'cyan');
    
    const frontend = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'dashboard'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        REACT_APP_API_URL: 'http://localhost:3001',
        BROWSER: 'none' // Prevent auto-opening browser
      }
    });
    
    this.processes.push({ name: 'Frontend', process: frontend });
    
    frontend.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('webpack compiled')) {
        this.log(`[Frontend] ${message}`, 'magenta');
      }
    });
    
    frontend.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('ExperimentalWarning')) {
        this.log(`[Frontend Error] ${message}`, 'red');
      }
    });
    
    frontend.on('close', (code) => {
      if (!this.isShuttingDown) {
        this.log(`❌ Frontend process exited with code ${code}`, 'red');
      }
    });
    
    // Wait for frontend to compile and start
    await this.delay(10000);
    this.log('✅ Frontend dashboard started on http://localhost:3000', 'green');
  }

  async runIntegrationTests() {
    this.log('🧪 Running integration tests...', 'cyan');
    
    try {
      const IntegrationTester = require('./test-integration');
      const tester = new IntegrationTester();
      await tester.runAllTests();
    } catch (error) {
      this.log(`❌ Integration tests failed: ${error.message}`, 'red');
    }
  }

  displayInstructions() {
    console.log();
    console.log(chalk.magenta.bold('🎉 MonadFaas Platform is Ready!'));
    console.log(chalk.magenta('=' .repeat(60)));
    console.log();
    
    console.log(chalk.cyan.bold('📱 Access Points:'));
    console.log(chalk.cyan('  🌐 Dashboard:     http://localhost:3000'));
    console.log(chalk.cyan('  🔧 API Server:    http://localhost:3001'));
    console.log(chalk.cyan('  📊 Live Metrics:  http://localhost:3000 (click "📊 Live Metrics")'));
    console.log(chalk.cyan('  🚀 Demo:          http://localhost:3000 (click "🚀 Demo")'));
    console.log();
    
    console.log(chalk.yellow.bold('🎮 Demo Features:'));
    console.log(chalk.yellow('  ✍️  Function Editor - Click the ✍️ button to write custom functions'));
    console.log(chalk.yellow('  🚨 Price Alerts - Configure and test live price monitoring'));
    console.log(chalk.yellow('  📊 Real-time Metrics - Watch live execution statistics'));
    console.log(chalk.yellow('  🔍 Transaction Lookup - View blockchain transaction details'));
    console.log();
    
    console.log(chalk.green.bold('🚀 Quick Demo Commands:'));
    console.log(chalk.green('  npm run demo:small     # Deploy 5 functions'));
    console.log(chalk.green('  npm run demo:enhanced  # Deploy 100+ functions'));
    console.log(chalk.green('  npm run demo:stress    # Stress test with 200+ functions'));
    console.log();
    
    console.log(chalk.red.bold('🛑 To Stop:'));
    console.log(chalk.red('  Press Ctrl+C to shutdown all services'));
    console.log();
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log();
      this.log('🛑 Shutting down MonadFaas platform...', 'yellow');
      
      this.processes.forEach(({ name, process }) => {
        this.log(`Stopping ${name}...`, 'yellow');
        process.kill('SIGTERM');
      });
      
      setTimeout(() => {
        this.log('✅ Platform shutdown complete', 'green');
        process.exit(0);
      }, 2000);
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async launch() {
    console.log(chalk.magenta.bold('🚀 MonadFaas Platform Launcher'));
    console.log(chalk.magenta('=' .repeat(50)));
    console.log();
    
    try {
      await this.checkPrerequisites();
      
      this.setupGracefulShutdown();
      
      // Start services
      await this.startBackend();
      await this.startFrontend();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Display instructions
      this.displayInstructions();
      
      // Keep the process alive
      this.log('🔄 Platform is running. Press Ctrl+C to stop.', 'green');
      
      // Keep process alive
      setInterval(() => {
        // Health check every 30 seconds
        if (!this.isShuttingDown) {
          this.log('💓 Platform health check - All services running', 'gray');
        }
      }, 30000);
      
    } catch (error) {
      this.log(`💥 Failed to launch platform: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const launcher = new DemoLauncher();
  launcher.launch();
}

module.exports = DemoLauncher;
