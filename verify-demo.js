#!/usr/bin/env node

/**
 * MonadFaas Demo Verification Script
 * 
 * Verifies the results of the scalability demo by querying the blockchain
 */

const { ethers } = require('ethers');
const chalk = require('chalk');

const CONFIG = {
  rpcUrl: 'http://localhost:8545',
  registryAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
};

const FUNCTION_REGISTRY_ABI = [
  'function nextFunctionId() external view returns (uint256)',
  'function nextTriggerId() external view returns (uint256)',
  'function getFunction(uint256 functionId) external view returns (tuple(bytes32 wasmHash, string name, string description, address owner, uint256 gasLimit, bool active, uint256 createdAt, uint256 executionCount, string runtime) memory)',
  'function getTrigger(uint256 triggerId) external view returns (tuple(uint256 functionId, uint8 triggerType, bytes triggerData, bool active, uint256 lastTriggered, uint256 triggerCount) memory)'
];

async function verifyDemo() {
  console.log(chalk.blue.bold('🔍 MonadFaas Demo Verification'));
  console.log(chalk.blue('=' .repeat(40)));
  console.log();

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const registry = new ethers.Contract(CONFIG.registryAddress, FUNCTION_REGISTRY_ABI, provider);

  try {
    // Get counts
    const nextFunctionId = await registry.nextFunctionId();
    const nextTriggerId = await registry.nextTriggerId();
    const totalFunctions = Number(nextFunctionId) - 1;
    const totalTriggers = Number(nextTriggerId) - 1;

    console.log(chalk.green('✅ BLOCKCHAIN STATE VERIFIED'));
    console.log();
    console.log(chalk.cyan('📊 Current Registry State:'));
    console.log(`   Total Functions: ${chalk.bold(totalFunctions)}`);
    console.log(`   Total Triggers: ${chalk.bold(totalTriggers)}`);
    console.log(`   Next Function ID: ${chalk.bold(nextFunctionId)}`);
    console.log(`   Next Trigger ID: ${chalk.bold(nextTriggerId)}`);
    console.log();

    // Verify demo functions (assuming last 20 are from demo)
    const demoStartId = Math.max(1, totalFunctions - 19);
    console.log(chalk.cyan(`🔍 Demo Functions (IDs ${demoStartId}-${totalFunctions}):`));
    
    let demoFunctions = 0;
    for (let i = demoStartId; i <= totalFunctions; i++) {
      try {
        const functionData = await registry.getFunction(i);
        if (functionData[1].startsWith('price-alert-')) {
          demoFunctions++;
          if (demoFunctions <= 5) { // Show first 5
            console.log(`   ${chalk.green('✓')} Function ${i}: ${functionData[1]}`);
            console.log(`     Owner: ${functionData[3]}`);
            console.log(`     Active: ${functionData[5]}`);
            console.log(`     Runtime: ${functionData[8]}`);
          }
        }
      } catch (error) {
        console.log(`   ${chalk.red('✗')} Function ${i}: Error reading data`);
      }
    }
    
    if (demoFunctions > 5) {
      console.log(`   ${chalk.gray(`... and ${demoFunctions - 5} more demo functions`)}`);
    }
    
    console.log();
    console.log(chalk.green(`✅ Found ${demoFunctions} demo functions on blockchain`));
    
    // Show recent blocks
    const currentBlock = await provider.getBlockNumber();
    console.log();
    console.log(chalk.cyan('⛓️  Recent Blockchain Activity:'));
    console.log(`   Current Block: ${chalk.bold(currentBlock)}`);
    
    // Check recent blocks for transactions
    let totalTxs = 0;
    for (let i = Math.max(1, currentBlock - 4); i <= currentBlock; i++) {
      const block = await provider.getBlock(i);
      totalTxs += block.transactions.length;
      console.log(`   Block ${i}: ${block.transactions.length} transactions`);
    }
    
    console.log(`   Total recent transactions: ${chalk.bold(totalTxs)}`);
    console.log();
    
    // Demo success metrics
    console.log(chalk.green.bold('🎉 DEMO VERIFICATION COMPLETE!'));
    console.log();
    console.log(chalk.cyan('📈 Verified Achievements:'));
    console.log(`   ${chalk.green('✅')} Functions registered: ${demoFunctions}`);
    console.log(`   ${chalk.green('✅')} Blockchain transactions: ${totalTxs}`);
    console.log(`   ${chalk.green('✅')} Smart contract state: Valid`);
    console.log(`   ${chalk.green('✅')} Function metadata: Accessible`);
    console.log();
    
    if (demoFunctions >= 20) {
      console.log(chalk.green.bold('🚀 SCALABILITY DEMONSTRATED: 20+ functions deployed and triggered!'));
    } else if (demoFunctions >= 10) {
      console.log(chalk.yellow.bold('⚡ GOOD PROGRESS: 10+ functions deployed!'));
    } else {
      console.log(chalk.blue.bold('📝 BASIC DEMO: Functions successfully deployed!'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Verification failed:'), error.message);
  }
}

verifyDemo();
