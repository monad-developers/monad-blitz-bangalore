#!/usr/bin/env node

/**
 * Verify Private Key Setup
 * This script checks if your private key is correctly configured
 */

const { ethers } = require('ethers');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    process.env[key.trim()] = value;
                }
            }
        }
        return true;
    }
    return false;
}

const EXPECTED_ADDRESS = '0x83412990439483714A5ab3CBa7a03AFb7363508C';

function verifyPrivateKey() {
    console.log(chalk.cyan.bold('🔐 Private Key Verification'));
    console.log('='.repeat(40));
    console.log();

    // Check if private key is set
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
        console.log(chalk.red('❌ PRIVATE_KEY environment variable not found'));
        console.log();
        console.log(chalk.yellow('How to set it:'));
        console.log(chalk.green('export PRIVATE_KEY="your_private_key_here"'));
        console.log();
        console.log(chalk.yellow('Or create .env file:'));
        console.log(chalk.green('echo "PRIVATE_KEY=your_private_key_here" > .env'));
        console.log();
        return false;
    }

    console.log(chalk.green('✅ PRIVATE_KEY environment variable found'));
    console.log();

    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
        console.log(chalk.red('❌ Invalid private key format'));
        console.log('   Private key should start with 0x and be 66 characters long');
        console.log(`   Current length: ${privateKey.length}`);
        console.log();
        return false;
    }

    console.log(chalk.green('✅ Private key format is valid'));
    console.log();

    // Derive address from private key
    try {
        const wallet = new ethers.Wallet(privateKey);
        const derivedAddress = wallet.address;
        
        console.log(chalk.cyan('📋 Address Verification:'));
        console.log(`   Expected: ${EXPECTED_ADDRESS}`);
        console.log(`   Derived:  ${derivedAddress}`);
        console.log();

        if (derivedAddress.toLowerCase() === EXPECTED_ADDRESS.toLowerCase()) {
            console.log(chalk.green.bold('🎉 SUCCESS! Private key matches your account!'));
            console.log();
            
            console.log(chalk.cyan('✅ You can now:'));
            console.log('   • Deploy contracts to Monad');
            console.log('   • Run demos with MON tokens');
            console.log('   • Use the dashboard');
            console.log();
            
            return true;
        } else {
            console.log(chalk.red('❌ MISMATCH! Private key does not match expected account'));
            console.log();
            console.log(chalk.yellow('💡 This means:'));
            console.log('   • You have the wrong private key');
            console.log('   • Or you want to use a different account');
            console.log();
            return false;
        }

    } catch (error) {
        console.log(chalk.red('❌ Error validating private key:'));
        console.log(chalk.red(`   ${error.message}`));
        console.log();
        return false;
    }
}

function showNextSteps() {
    console.log(chalk.cyan.bold('🚀 Next Steps:'));
    console.log('='.repeat(20));
    console.log();
    
    console.log('1. Fund your account with MON tokens');
    console.log(`   Address: ${EXPECTED_ADDRESS}`);
    console.log();
    
    console.log('2. Deploy contracts to Monad:');
    console.log(chalk.green('   cd contracts'));
    console.log(chalk.green('   forge script script/DeployFunctionRegistry.s.sol:DeployFunctionRegistry --rpc-url https://rpc.monad.xyz --broadcast'));
    console.log();
    
    console.log('3. Run demos:');
    console.log(chalk.green('   node demo-script.js --functions=5'));
    console.log();
    
    console.log('4. Start dashboard:');
    console.log(chalk.green('   cd dashboard && npm start'));
    console.log();
}

// Main execution
function main() {
    console.clear();

    // Load .env file first
    const envLoaded = loadEnvFile();
    if (envLoaded) {
        console.log(chalk.green('✅ .env file loaded successfully'));
        console.log();
    }

    const isValid = verifyPrivateKey();
    
    if (isValid) {
        showNextSteps();
    } else {
        console.log(chalk.yellow('🔧 Setup Instructions:'));
        console.log();
        console.log('1. Get your private key from MetaMask:');
        console.log('   • Open MetaMask');
        console.log('   • Click account menu → Account Details');
        console.log('   • Click "Export Private Key"');
        console.log('   • Enter password and copy the key');
        console.log();
        
        console.log('2. Set the private key:');
        console.log(chalk.green('   export PRIVATE_KEY="your_private_key_here"'));
        console.log();
        
        console.log('3. Run this script again:');
        console.log(chalk.green('   node verify-setup.js'));
        console.log();
    }
}

if (require.main === module) {
    main();
}

module.exports = { verifyPrivateKey, EXPECTED_ADDRESS };
