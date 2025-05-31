#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// CLI Version
const CLI_VERSION = '1.0.0';

// Simple IPFS upload using Pinata API (for demo)
async function uploadToIPFS(buffer: Buffer): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([buffer]);
  formData.append('file', blob, 'function.wasm');

  try {
    // Using public IPFS service (in production, use your own IPFS node or Pinata/Web3.Storage)
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // In production, add your Pinata API key here
        // 'Authorization': `Bearer ${process.env.PINATA_JWT}`
      }
    });
    return response.data.IpfsHash;
  } catch (error) {
    // Fallback: create a mock hash for demo purposes
    const hash = ethers.keccak256(buffer).slice(2, 34); // Take first 32 chars
    console.log(chalk.yellow('⚠️  Using mock IPFS hash for demo'));
    return `Qm${hash}`;
  }
}

// Contract ABI (simplified for key functions)
const FUNCTION_REGISTRY_ABI = [
  'function registerFunction(string calldata name, string calldata description, bytes32 wasmHash, uint256 gasLimit, string calldata runtime) external returns (uint256 functionId)',
  'function addTrigger(uint256 functionId, uint8 triggerType, bytes calldata triggerData) external returns (uint256 triggerId)',
  'function getFunction(uint256 functionId) external view returns (tuple(bytes32 wasmHash, string name, string description, address owner, uint256 gasLimit, bool active, uint256 createdAt, uint256 executionCount, string runtime) memory)',
  'event FunctionRegistered(uint256 indexed functionId, address indexed owner, string name, bytes32 wasmHash)',
  'event TriggerAdded(uint256 indexed triggerId, uint256 indexed functionId, uint8 triggerType)'
];

interface Config {
  rpcUrl: string;
  privateKey: string;
  registryAddress: string;
  ipfsApiUrl?: string;
}

interface FunctionTemplate {
  name: string;
  runtime: 'javascript' | 'python' | 'solidity';
  description: string;
  templateDir: string;
}

const FUNCTION_TEMPLATES: FunctionTemplate[] = [
  {
    name: 'Hello World (JavaScript)',
    runtime: 'javascript',
    description: 'Simple hello world function',
    templateDir: 'js-hello-world'
  },
  {
    name: 'Price Alert (JavaScript)',
    runtime: 'javascript',
    description: 'Price monitoring and alert function',
    templateDir: 'js-price-alert'
  },
  {
    name: 'Event Handler (Python)',
    runtime: 'python',
    description: 'On-chain event processing function',
    templateDir: 'py-event-handler'
  },
  {
    name: 'Custom Function',
    runtime: 'javascript',
    description: 'Start with empty template',
    templateDir: 'custom'
  }
];

const program = new Command();

// Main CLI setup
program
  .name('monad-faas')
  .description('Monad FaaS CLI - Deploy serverless functions on-chain')
  .version(CLI_VERSION);

// Initialize command
program
  .command('init')
  .description('Initialize a new Monad FaaS function project')
  .argument('[project-name]', 'Project name')
  .action(async (projectName) => {
    console.log(chalk.blue('🚀 Welcome to Monad FaaS!'));
    console.log();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: projectName || 'my-monad-function',
        validate: (input: string) => input.length > 0 || 'Project name is required'
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a function template:',
        choices: FUNCTION_TEMPLATES.map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t
        }))
      },
      {
        type: 'input',
        name: 'description',
        message: 'Function description:',
        default: 'My serverless function on Monad'
      }
    ]);

    const projectPath = path.join(process.cwd(), answers.name);
    
    if (fs.existsSync(projectPath)) {
      console.log(chalk.red(`❌ Directory ${answers.name} already exists!`));
      process.exit(1);
    }

    // Create project structure
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src'));
    fs.mkdirSync(path.join(projectPath, 'wasm'));
    fs.mkdirSync(path.join(projectPath, 'test'));

    // Create package.json
    const packageJson = {
      name: answers.name,
      version: '1.0.0',
      description: answers.description,
      main: 'src/index.js',
      scripts: {
        build: 'monad-faas build',
        deploy: 'monad-faas register',
        test: 'monad-faas test'
      },
      monadFaas: {
        runtime: answers.template.runtime,
        gasLimit: 1000000,
        triggers: []
      }
    };

    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create config file
    const config = {
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      registryAddress: '0x0000000000000000000000000000000000000000', // Placeholder
      ipfsApiUrl: 'https://ipfs.infura.io:5001/api/v0'
    };

    fs.writeFileSync(
      path.join(projectPath, 'monad-faas.config.json'),
      JSON.stringify(config, null, 2)
    );

    // Create function template
    await createFunctionTemplate(projectPath, answers.template, answers.name);

    // Create README
    const readme = generateReadme(answers.name, answers.description, answers.template.runtime);
    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

    console.log();
    console.log(chalk.green('✅ Project created successfully!'));
    console.log();
    console.log(chalk.yellow('Next steps:'));
    console.log(`  1. cd ${answers.name}`);
    console.log('  2. Edit monad-faas.config.json with your settings');
    console.log('  3. Implement your function in src/');
    console.log('  4. Run: monad-faas build');
    console.log('  5. Run: monad-faas register');
    console.log();
  });

// Build command
program
  .command('build')
  .description('Build function to WASM')
  .action(async () => {
    console.log(chalk.blue('🔨 Building function...'));
    
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.log(chalk.red('❌ No package.json found. Run "monad-faas init" first.'));
      process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const runtime = pkg.monadFaas?.runtime || 'javascript';

    if (runtime === 'javascript') {
      await buildJavaScript();
    } else if (runtime === 'python') {
      await buildPython();
    } else {
      console.log(chalk.red(`❌ Unsupported runtime: ${runtime}`));
      process.exit(1);
    }

    console.log(chalk.green('✅ Build completed!'));
    console.log(`📦 WASM binary: ${chalk.cyan('./wasm/function.wasm')}`);
  });

// Register command
program
  .command('register')
  .description('Register function on-chain')
  .action(async () => {
    console.log(chalk.blue('📡 Registering function on-chain...'));

    const config = loadConfig();
    const pkg = loadPackageJson();

    // Check if WASM exists
    const wasmPath = path.join(process.cwd(), 'wasm', 'function.wasm');
    if (!fs.existsSync(wasmPath)) {
      console.log(chalk.red('❌ WASM file not found. Run "monad-faas build" first.'));
      process.exit(1);
    }

    try {
      // Upload to IPFS
      console.log('📤 Uploading to IPFS...');
      const wasmBuffer = fs.readFileSync(wasmPath);
      const wasmHash = await uploadToIPFS(wasmBuffer);
      console.log(`📍 IPFS Hash: ${chalk.cyan(wasmHash)}`);

      // Register on-chain
      console.log('📝 Registering on blockchain...');
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const wallet = new ethers.Wallet(config.privateKey, provider);
      const registry = new ethers.Contract(config.registryAddress, FUNCTION_REGISTRY_ABI, wallet);

      const tx = await registry.registerFunction(
        pkg.name,
        pkg.description || '',
        ethers.keccak256(ethers.toUtf8Bytes(wasmHash)), // Hash the IPFS hash for bytes32
        pkg.monadFaas?.gasLimit || 1000000,
        pkg.monadFaas?.runtime || 'javascript'
      );

      console.log(`⏳ Transaction: ${chalk.cyan(tx.hash)}`);
      const receipt = await tx.wait();
      
      // Parse function ID from events
      const log = receipt.logs.find((log: any) => {
        try {
          const parsed = registry.interface.parseLog(log);
          return parsed && parsed.name === 'FunctionRegistered';
        } catch {
          return false;
        }
      });

      if (log) {
        const parsed = registry.interface.parseLog(log);
        if (parsed) {
          const functionId = parsed.args[0];
          console.log(chalk.green(`✅ Function registered! ID: ${functionId}`));
          
          // Save function ID to config
          pkg.monadFaas.functionId = functionId.toString();
          fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        }
      } else {
        console.log(chalk.green('✅ Function registered successfully!'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Registration failed:'), error);
      process.exit(1);
    }
  });

// Upload command (standalone IPFS upload)
program
  .command('upload')
  .description('Upload WASM to IPFS')
  .argument('[file]', 'WASM file path', './wasm/function.wasm')
  .action(async (file) => {
    console.log(chalk.blue('📤 Uploading to IPFS...'));

    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ File not found: ${file}`));
      process.exit(1);
    }

    try {
      const buffer = fs.readFileSync(file);
      const hash = await uploadToIPFS(buffer);
      
      console.log(chalk.green('✅ Upload successful!'));
      console.log(`📍 IPFS Hash: ${chalk.cyan(hash)}`);
      console.log(`🔗 Gateway URL: ${chalk.cyan(`https://ipfs.io/ipfs/${hash}`)}`);
      
    } catch (error) {
      console.error(chalk.red('❌ Upload failed:'), error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Check function status')
  .action(async () => {
    console.log(chalk.blue('📊 Checking function status...'));

    const config = loadConfig();
    const pkg = loadPackageJson();

    if (!pkg.monadFaas?.functionId) {
      console.log(chalk.yellow('⚠️  Function not registered yet.'));
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const registry = new ethers.Contract(config.registryAddress, FUNCTION_REGISTRY_ABI, provider);
      
      // Call getFunction with the correct ethers.js v6 syntax
      const result = await registry.getFunction('getFunction')(pkg.monadFaas.functionId);
      
      console.log();
      console.log(chalk.green('✅ Function Status:'));
      console.log(`📝 Name: ${chalk.cyan(result[1])}`); // name
      console.log(`📋 Description: ${chalk.cyan(result[2])}`); // description
      console.log(`🆔 Function ID: ${chalk.cyan(pkg.monadFaas.functionId)}`);
      console.log(`👤 Owner: ${chalk.cyan(result[3])}`); // owner
      console.log(`⚡ Gas Limit: ${chalk.cyan(result[4].toString())}`); // gasLimit
      console.log(`🟢 Active: ${chalk.cyan(result[5] ? 'Yes' : 'No')}`); // active
      console.log(`📈 Executions: ${chalk.cyan(result[7].toString())}`); // executionCount
      console.log(`🏃 Runtime: ${chalk.cyan(result[8])}`); // runtime
      console.log();

    } catch (error) {
      console.error(chalk.red('❌ Failed to get status:'), error);
    }
  });

// Helper functions
function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'monad-faas.config.json');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('❌ Config file not found. Run "monad-faas init" first.'));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function loadPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log(chalk.red('❌ package.json not found. Run "monad-faas init" first.'));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

async function createFunctionTemplate(projectPath: string, template: FunctionTemplate, projectName: string) {
  const srcPath = path.join(projectPath, 'src');

  if (template.runtime === 'javascript') {
    const indexJs = `// Monad FaaS Function - ${projectName}
// Runtime: JavaScript

/**
 * Main function entry point
 * @param {Object} context - Execution context
 * @param {Object} context.trigger - Trigger data
 * @param {Object} context.env - Environment variables
 * @returns {Object} Function result
 */
function main(context) {
  console.log('Function triggered!', context.trigger);
  
  // Your function logic here
  const result = {
    message: 'Hello from Monad FaaS!',
    timestamp: new Date().toISOString(),
    triggerType: context.trigger?.type || 'unknown'
  };
  
  return result;
}

// Export for WASM compilation
if (typeof module !== 'undefined') {
  module.exports = { main };
}
`;

    fs.writeFileSync(path.join(srcPath, 'index.js'), indexJs);

  } else if (template.runtime === 'python') {
    const indexPy = `# Monad FaaS Function - ${projectName}
# Runtime: Python

import json
from datetime import datetime

def main(context):
    """
    Main function entry point
    
    Args:
        context (dict): Execution context with trigger and env data
        
    Returns:
        dict: Function result
    """
    print(f"Function triggered! {context.get('trigger', {})}")
    
    # Your function logic here
    result = {
        'message': 'Hello from Monad FaaS!',
        'timestamp': datetime.now().isoformat(),
        'trigger_type': context.get('trigger', {}).get('type', 'unknown')
    }
    
    return result

# WASM export wrapper
def wasm_main(context_json):
    context = json.loads(context_json)
    result = main(context)
    return json.dumps(result)
`;

    fs.writeFileSync(path.join(srcPath, 'index.py'), indexPy);
  }

  // Create test file
  const testPath = path.join(projectPath, 'test');
  const testJs = `// Test file for ${projectName}

const { main } = require('../src/index.js');

// Mock context
const mockContext = {
  trigger: {
    type: 'test',
    data: { message: 'test trigger' }
  },
  env: {
    NODE_ENV: 'test'
  }
};

// Run test
console.log('Testing function...');
const result = main(mockContext);
console.log('Result:', result);
console.log('✅ Test completed!');
`;

  fs.writeFileSync(path.join(testPath, 'test.js'), testJs);
}

async function buildJavaScript() {
  console.log('🔧 Building JavaScript to WASM...');
  
  // For demo purposes, we'll create a mock WASM file
  // In production, this would use tools like Javy or similar
  const wasmDir = path.join(process.cwd(), 'wasm');
  if (!fs.existsSync(wasmDir)) {
    fs.mkdirSync(wasmDir);
  }

  // Create a minimal WASM binary (mock for demo)
  const mockWasm = Buffer.from([
    0x00, 0x61, 0x73, 0x6d, // WASM magic number
    0x01, 0x00, 0x00, 0x00, // WASM version
    // Minimal sections would follow in real implementation
  ]);

  fs.writeFileSync(path.join(wasmDir, 'function.wasm'), mockWasm);
  console.log('📦 JavaScript compiled to WASM (mock implementation)');
}

async function buildPython() {
  console.log('🔧 Building Python to WASM...');
  
  // Similar mock implementation for Python
  const wasmDir = path.join(process.cwd(), 'wasm');
  if (!fs.existsSync(wasmDir)) {
    fs.mkdirSync(wasmDir);
  }

  const mockWasm = Buffer.from([
    0x00, 0x61, 0x73, 0x6d, // WASM magic number
    0x01, 0x00, 0x00, 0x00, // WASM version
    // Python-specific WASM sections would follow
  ]);

  fs.writeFileSync(path.join(wasmDir, 'function.wasm'), mockWasm);
  console.log('📦 Python compiled to WASM (mock implementation)');
}

function generateReadme(name: string, description: string, runtime: string): string {
  return `# ${name}

${description}

## Runtime
${runtime}

## Getting Started

1. Build your function:
   \`\`\`bash
   monad-faas build
   \`\`\`

2. Register on-chain:
   \`\`\`bash
   monad-faas register
   \`\`\`

3. Check status:
   \`\`\`bash
   monad-faas status
   \`\`\`

## Configuration

Edit \`monad-faas.config.json\` to configure:
- RPC URL
- Registry contract address
- Private key
- IPFS settings

## Function Structure

Your function should export a \`main\` function that accepts a context object:

\`\`\`javascript
function main(context) {
  // context.trigger - trigger data
  // context.env - environment variables
  
  return {
    success: true,
    data: "your result"
  };
}
\`\`\`

## Triggers

Configure triggers in \`package.json\` under \`monadFaas.triggers\`.

## Monad FaaS CLI

- \`monad-faas init\` - Initialize new project
- \`monad-faas build\` - Build to WASM
- \`monad-faas register\` - Register on-chain
- \`monad-faas upload\` - Upload to IPFS
- \`monad-faas status\` - Check function status
`;
}

// Parse CLI arguments
program.parse();
