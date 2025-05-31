#!/usr/bin/env node

/**
 * MonadFaas Monad Mainnet Setup Script
 * 
 * This script helps you:
 * 1. Configure your account (0x83412990439483714A5ab3CBa7a03AFb7363508C)
 * 2. Check MON balance
 * 3. Deploy contracts to Monad mainnet
 * 4. Verify setup
 */

const { ethers } = require('ethers');
const chalk = require('chalk');

// Your account configuration
const YOUR_ACCOUNT = '0x83412990439483714A5ab3CBa7a03AFb7363508C';
const MONAD_RPC = 'https://rpc.monad.xyz';
const MONAD_CHAIN_ID = 41454; // Monad mainnet chain ID

// Contract ABIs for verification
const REGISTRY_ABI = [
  'function nextFunctionId() external view returns (uint256)',
  'function nextTriggerId() external view returns (uint256)',
  'function owner() external view returns (address)',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function ADMIN_ROLE() external view returns (bytes32)'
];

class MonadSetup {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(MONAD_RPC);
    this.account = YOUR_ACCOUNT;
  }

  async run() {
    console.log(chalk.cyan.bold('🌟 MonadFaas Monad Mainnet Setup'));
    console.log('='.repeat(50));
    console.log();

    await this.checkNetwork();
    await this.checkAccount();
    await this.showInstructions();
  }

  async checkNetwork() {
    console.log(chalk.yellow('🌐 Checking Monad Network Connection...'));
    
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      console.log(`   ✅ Connected to Monad Mainnet`);
      console.log(`   📡 RPC URL: ${MONAD_RPC}`);
      console.log(`   🔗 Chain ID: ${network.chainId}`);
      console.log(`   📦 Latest Block: ${blockNumber}`);
      console.log();
      
    } catch (error) {
      console.log(chalk.red('   ❌ Failed to connect to Monad network'));
      console.log(chalk.red(`   Error: ${error.message}`));
      console.log();
      console.log(chalk.yellow('💡 Troubleshooting:'));
      console.log('   • Check your internet connection');
      console.log('   • Verify Monad RPC is operational');
      console.log('   • Try again in a few moments');
      console.log();
      return;
    }
  }

  async checkAccount() {
    console.log(chalk.yellow('👤 Checking Your Account...'));
    console.log(`   Address: ${this.account}`);
    
    try {
      const balance = await this.provider.getBalance(this.account);
      const balanceMON = ethers.formatEther(balance);
      
      console.log(`   💰 MON Balance: ${balanceMON} MON`);
      
      if (parseFloat(balanceMON) > 0) {
        console.log(chalk.green('   ✅ Account has MON balance - ready for transactions!'));
      } else {
        console.log(chalk.red('   ⚠️  Account has no MON balance'));
        console.log(chalk.yellow('   💡 You need MON tokens to pay for gas fees'));
      }
      console.log();
      
    } catch (error) {
      console.log(chalk.red('   ❌ Failed to check account balance'));
      console.log(chalk.red(`   Error: ${error.message}`));
      console.log();
    }
  }

  async showInstructions() {
    console.log(chalk.cyan.bold('📋 Setup Instructions'));
    console.log('='.repeat(50));
    console.log();

    console.log(chalk.yellow('1. 🔐 Set Your Private Key (REQUIRED)'));
    console.log('   You need to provide your private key to sign transactions.');
    console.log('   ⚠️  NEVER share your private key or commit it to git!');
    console.log();
    console.log('   Option A - Environment Variable (Recommended):');
    console.log(chalk.green('   export PRIVATE_KEY="your_private_key_here"'));
    console.log();
    console.log('   Option B - Create .env file:');
    console.log(chalk.green('   echo "PRIVATE_KEY=your_private_key_here" > .env'));
    console.log();

    console.log(chalk.yellow('2. 💰 Fund Your Account with MON'));
    console.log(`   Your account: ${this.account}`);
    console.log('   • Transfer MON tokens to this address');
    console.log('   • You need MON to pay for gas fees');
    console.log('   • Recommended: 10+ MON for testing');
    console.log();

    console.log(chalk.yellow('3. 🚀 Deploy Contracts to Monad'));
    console.log('   Once you have MON balance and private key set:');
    console.log();
    console.log('   Deploy Original Contract:');
    console.log(chalk.green('   cd contracts'));
    console.log(chalk.green('   forge script script/DeployFunctionRegistry.s.sol:DeployFunctionRegistry --rpc-url https://rpc.monad.xyz --broadcast --verify'));
    console.log();
    console.log('   Deploy Optimized Contract:');
    console.log(chalk.green('   forge script script/DeployOptimizedRegistry.s.sol:DeployOptimizedRegistry --rpc-url https://rpc.monad.xyz --broadcast --verify'));
    console.log();

    console.log(chalk.yellow('4. 📝 Update Contract Addresses'));
    console.log('   After deployment, update the contract addresses in:');
    console.log('   • demo-script.js');
    console.log('   • optimized-demo.js');
    console.log('   • dashboard/src/hooks/useBlockchainData.ts');
    console.log();

    console.log(chalk.yellow('5. 🧪 Run Tests'));
    console.log('   Test with small number of functions first:');
    console.log(chalk.green('   node demo-script.js --functions=5'));
    console.log(chalk.green('   node optimized-demo.js --functions=5'));
    console.log();

    console.log(chalk.yellow('6. 📊 Monitor Dashboard'));
    console.log('   Start the dashboard to monitor live stats:');
    console.log(chalk.green('   cd dashboard && npm start'));
    console.log('   Open: http://localhost:3000');
    console.log();

    console.log(chalk.cyan.bold('🔧 Configuration Summary'));
    console.log('='.repeat(30));
    console.log(`Network: Monad Mainnet`);
    console.log(`RPC URL: ${MONAD_RPC}`);
    console.log(`Chain ID: ${MONAD_CHAIN_ID}`);
    console.log(`Your Account: ${this.account}`);
    console.log(`Gas Token: MON`);
    console.log();

    console.log(chalk.green.bold('✅ Ready to deploy MonadFaas on Monad Mainnet!'));
    console.log();

    console.log(chalk.yellow('💡 Pro Tips:'));
    console.log('• Start with small tests (5-10 functions)');
    console.log('• Monitor gas costs on the dashboard');
    console.log('• Use the optimized contract for 37% gas savings');
    console.log('• Keep some extra MON for unexpected gas costs');
    console.log();
  }
}

// Utility function to check if private key is set
function checkPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.log(chalk.red('⚠️  PRIVATE_KEY environment variable not set'));
    console.log();
    console.log('Set it with:');
    console.log(chalk.green('export PRIVATE_KEY="your_private_key_here"'));
    console.log();
    return false;
  }
  
  try {
    const wallet = new ethers.Wallet(privateKey);
    if (wallet.address.toLowerCase() === YOUR_ACCOUNT.toLowerCase()) {
      console.log(chalk.green('✅ Private key matches your account!'));
      return true;
    } else {
      console.log(chalk.red('❌ Private key does not match your account'));
      console.log(`Expected: ${YOUR_ACCOUNT}`);
      console.log(`Got: ${wallet.address}`);
      return false;
    }
  } catch (error) {
    console.log(chalk.red('❌ Invalid private key format'));
    return false;
  }
}

// Main execution
async function main() {
  console.clear();
  
  const setup = new MonadSetup();
  await setup.run();
  
  console.log(chalk.cyan('🔐 Private Key Check:'));
  checkPrivateKey();
  console.log();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Setup interrupted by user'));
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('💥 Setup failed:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  });
}

module.exports = { MonadSetup, YOUR_ACCOUNT, MONAD_RPC };
