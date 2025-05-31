#!/usr/bin/env node

/**
 * MonadFaas Integration Test Script
 * 
 * Tests the complete integration between frontend and backend
 * including API endpoints, WebSocket connections, and function deployment
 */

require('dotenv').config();
const axios = require('axios');
const chalk = require('chalk');

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

class IntegrationTester {
  constructor() {
    this.testResults = [];
  }

  async runTest(name, testFn) {
    console.log(chalk.cyan(`🧪 Testing: ${name}`));
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      console.log(chalk.green(`✅ ${name} - PASSED (${duration}ms)`));
      this.testResults.push({ name, status: 'PASSED', duration });
    } catch (error) {
      console.log(chalk.red(`❌ ${name} - FAILED: ${error.message}`));
      this.testResults.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async testHealthEndpoint() {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (response.data.status !== 'healthy') {
      throw new Error(`Expected healthy status, got ${response.data.status}`);
    }
  }

  async testMetricsEndpoint() {
    const response = await axios.get(`${API_BASE_URL}/api/metrics`);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.success) {
      throw new Error('Metrics endpoint returned unsuccessful response');
    }
    if (!response.data.data.execution) {
      throw new Error('Missing execution metrics');
    }
  }

  async testFunctionDeployment() {
    const functionData = {
      name: `TestFunction_${Date.now()}`,
      description: 'Integration test function',
      code: `
        export async function handler(ctx) {
          return {
            success: true,
            message: 'Integration test successful',
            timestamp: new Date().toISOString()
          };
        }
      `,
      runtime: 'javascript',
      triggerType: 'PRICE_THRESHOLD',
      triggerConfig: { token: 'ARB/USDC', threshold: 0.75 },
      webhookUrl: 'https://webhook.site/test',
      gasLimit: 500000
    };

    const response = await axios.post(`${API_BASE_URL}/api/functions/deploy`, functionData);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error(`Deployment failed: ${response.data.error}`);
    }
    
    if (!response.data.data.functionId) {
      throw new Error('No function ID returned');
    }
    
    return response.data.data;
  }

  async testFunctionRetrieval(functionId) {
    const response = await axios.get(`${API_BASE_URL}/api/functions/${functionId}`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Function retrieval failed');
    }
    
    if (response.data.data.functionId !== functionId) {
      throw new Error('Function ID mismatch');
    }
  }

  async testMetricsRecording() {
    const executionData = {
      functionId: 1,
      triggerId: 1,
      txHash: '0x' + Math.random().toString(16).slice(2).padStart(64, '0'),
      gasUsed: 150000,
      success: true,
      executionTime: 1500,
      phase: 'test'
    };

    const response = await axios.post(`${API_BASE_URL}/api/metrics/execution`, executionData);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Metrics recording failed');
    }
  }

  async testTransactionLookup() {
    const txHash = '0x' + Math.random().toString(16).slice(2).padStart(64, '0');
    const response = await axios.get(`${API_BASE_URL}/api/metrics/transaction/${txHash}`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Transaction lookup failed');
    }
    
    if (!response.data.data.transaction) {
      throw new Error('No transaction data returned');
    }
  }

  async testDemoStart() {
    const demoConfig = {
      numFunctions: 5,
      enableMetrics: true,
      stressTest: false
    };

    const response = await axios.post(`${API_BASE_URL}/api/demo/start`, demoConfig);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error(`Demo start failed: ${response.data.error}`);
    }
  }

  async testDemoStatus() {
    const response = await axios.get(`${API_BASE_URL}/api/demo/status`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Demo status check failed');
    }
  }

  async testFrontendAccess() {
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Frontend server not running');
      }
      throw error;
    }
  }

  async runAllTests() {
    console.log(chalk.magenta.bold('🚀 MonadFaas Integration Test Suite'));
    console.log(chalk.magenta('=' .repeat(50)));
    console.log();

    // Test API endpoints
    await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
    await this.runTest('Metrics Endpoint', () => this.testMetricsEndpoint());
    await this.runTest('Metrics Recording', () => this.testMetricsRecording());
    await this.runTest('Transaction Lookup', () => this.testTransactionLookup());
    
    // Test function deployment
    let deploymentResult;
    await this.runTest('Function Deployment', async () => {
      deploymentResult = await this.testFunctionDeployment();
    });
    
    if (deploymentResult) {
      await this.runTest('Function Retrieval', () => 
        this.testFunctionRetrieval(deploymentResult.functionId)
      );
    }
    
    // Test demo functionality
    await this.runTest('Demo Start', () => this.testDemoStart());
    await this.runTest('Demo Status', () => this.testDemoStatus());
    
    // Test frontend
    await this.runTest('Frontend Access', () => this.testFrontendAccess());

    // Display results
    this.displayResults();
  }

  displayResults() {
    console.log();
    console.log(chalk.magenta.bold('📊 Test Results Summary'));
    console.log(chalk.magenta('=' .repeat(50)));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log(chalk.green(`✅ Passed: ${passed}/${total}`));
    console.log(chalk.red(`❌ Failed: ${failed}/${total}`));
    console.log(chalk.cyan(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`));
    
    if (failed > 0) {
      console.log();
      console.log(chalk.red.bold('Failed Tests:'));
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(result => {
          console.log(chalk.red(`  ❌ ${result.name}: ${result.error}`));
        });
    }
    
    console.log();
    if (failed === 0) {
      console.log(chalk.green.bold('🎉 All tests passed! Integration is working correctly.'));
      console.log(chalk.cyan('You can now access:'));
      console.log(chalk.cyan(`  📊 Dashboard: ${FRONTEND_URL}`));
      console.log(chalk.cyan(`  🔧 API: ${API_BASE_URL}`));
    } else {
      console.log(chalk.yellow.bold('⚠️  Some tests failed. Please check the server logs and configuration.'));
    }
  }
}

// Main execution
async function main() {
  const tester = new IntegrationTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error(chalk.red.bold('💥 Test suite crashed:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = IntegrationTester;
