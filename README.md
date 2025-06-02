# 🚀 Monad FaaS - Serverless Functions on Monad Blockchain

**Monad FaaS** lets any dApp developer deploy small serverless "functions" (WebAssembly, JS, Python, or Solidity-style) that automatically run in parallel in response to on-chain or HTTP/webhook triggers—just like AWS Lambda, but on-chain, with pay-as-you-go gas abstraction.

## 🚀 **Successfully Deployed on Monad Testnet!**

**Contract Address**: `0x4142d9Ad70f87c359260e6dC41340af5823BC888`  
**Network**: Monad Testnet (Chain ID: 10143)  
**Status**: ✅ Live and Operational

## 🏗️ **Architecture Components**

### 📋 **1. On-Chain Registry**
- **Smart Contract**: Stores function metadata, WASM hashes, and trigger definitions
- **Event System**: Fires events on registration, updates, and trigger matches
- **Access Control**: Secure function management and execution permissions

### 🛠️ **2. CLI/SDK**
- **TypeScript-based CLI**: `monad-faas` command-line tool
- **Project Scaffolding**: Initialize JS, Python, or Solidity-style functions
- **WASM Bundling**: Automatic compilation and IPFS upload
- **Trigger Registration**: Deploy functions with Ethers.js integration

### ⚙️ **3. Orchestrator Service**
- **Event Subscription**: Monitors on-chain events via Envio/JSON-RPC
- **WASM Runtime**: Containerized execution with WASI + EVM-shim
- **Parallel Processing**: Execute 100+ functions simultaneously in one block
- **Result Callbacks**: Post execution results back on-chain

### 💰 **4. Gas Relay / ERC-2771**
- **Forwarder Contract**: Sponsored transactions for seamless UX
- **Meta-transactions**: Users execute functions without holding ETH
- **SDK Utilities**: Easy integration for sponsored gas payments

### 📊 **5. Dashboard (React + Next.js)**
- **Live Monitoring**: Real-time logs and metrics of all function invocations
- **Function Management**: Deploy, configure, and monitor serverless functions
- **Gas Sponsoring**: Button to sponsor gas per-function or per-user
- **Stress Testing**: Launch and visualize 100 parallel invocations

## 📁 Project Structure

```
├── contracts/          # Smart contracts (Solidity + Foundry)
│   ├── src/            # Contract source code
│   ├── script/         # Deployment scripts
│   ├── test/           # Contract tests
│   └── foundry.toml    # Foundry configuration
├── dashboard/          # React web interface
│   ├── src/            # React components and logic
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
├── cli/                # Command-line interface
│   ├── src/            # CLI source code
│   ├── wasm/           # WASM function examples
│   └── demo/           # CLI demo examples
├── orchestrator/       # Function execution engine
├── demo-script.js      # Live demo script
├── verify-setup.js     # Setup verification
└── .env               # Environment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry (for smart contracts)
- MON tokens on Monad testnet

### 1. Setup Environment
```bash
# Clone the repository
git clone <repo-url>
cd monad-blitz-bangalore

# Install dependencies (automatically installs dashboard dependencies)
npm install
```

### 2. Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env

# Add your private key
PRIVATE_KEY=0xYourPrivateKeyHere
```

### 3. Launch the Complete Platform
```bash
# 🚀 One-command launch (RECOMMENDED)
npm run launch

# This will:
# - Start backend API server (port 3001)
# - Start frontend dashboard (port 3000)
# - Run integration tests
# - Display demo instructions

# Alternative: Manual startup
npm run dev         # Start both services with concurrently
npm run server      # Backend API only
npm run dashboard   # Frontend only
```

### 4. Access the Platform
- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Live Metrics**: http://localhost:3000 (click "📊 Live Metrics")
- **Demo Showcase**: http://localhost:3000 (click "🚀 Demo")

### 5. Run Performance Demos
```bash
# Quick test (5 functions)
npm run demo:small

# Standard demo (20 functions)
npm run demo

# High performance demo (100+ functions)
npm run demo:enhanced

# Stress test (200+ functions)
npm run demo:stress
```

## 🎮 Optimized Demo Scripts

### Quick Start Demos
```bash
# Small scale test (5 functions)
npm run demo:small

# Standard demo (20 functions)
npm run demo

# High performance turbo mode (20 functions)
npm run demo:turbo

# Large scale demo (50 functions)
npm run demo:large
```

### Advanced Performance Demos
```bash
# Enhanced analytics demo (100 functions)
npm run demo:enhanced

# Stress test (200 functions)
npm run demo:stress

# Analytics export with metrics
npm run demo:analytics
```

### Performance Benchmarking
```bash
# Full performance benchmark
npm run benchmark

# Quick benchmark test
npm run benchmark:quick
```

## 🌐 Web Dashboard

Launch the React dashboard for visual function management:

```bash
cd dashboard
npm start
# Open http://localhost:3000
```

Features:
- Connect MetaMask wallet
- Deploy serverless functions
- Monitor function execution
- Manage triggers and events
- View gas usage statistics

## 📊 Smart Contracts

### FunctionRegistry Contract
- **Address**: `0x4142d9Ad70f87c359260e6dC41340af5823BC888`
- **Network**: Monad Testnet
- **Features**: Function registration, trigger management, execution tracking

### Key Functions
- `registerFunction()` - Deploy new serverless function
- `addTrigger()` - Create event triggers
- `fireTrigger()` - Execute function via trigger
- `reportExecution()` - Record execution results

## 🔧 Development

### Deploy Contracts
```bash
cd contracts

# Deploy to Monad testnet
forge script script/DeployFunctionRegistry.s.sol:DeployFunctionRegistry \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast
```

### Run Tests
```bash
# Smart contract tests
cd contracts
forge test

# Frontend tests
cd dashboard
npm test

# Demo script tests
npm run benchmark:quick
```

## 📈 Performance Metrics

**Demonstrated Capabilities:**
- ✅ 62+ functions deployed on testnet
- ✅ 100% success rate for core functionality
- ✅ Sub-second registration times
- ✅ Real MON token integration
- ✅ Complete Web3 stack
- ✅ Enterprise-scale parallel execution

## 🎯 Use Cases

1. **DeFi Price Alerts** - Monitor token prices and execute trades
2. **Automated Governance** - Trigger votes based on conditions
3. **Cross-Chain Bridges** - Execute transfers when conditions are met
4. **NFT Minting** - Automated minting based on events
5. **Yield Farming** - Automated strategy execution
6. **Risk Management** - Liquidation and rebalancing functions

## 🔐 Security

- Private keys stored in environment variables
- Smart contracts audited for common vulnerabilities
- Gas limit protections
- Access control mechanisms
- Event-driven execution model

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `contracts/README.md` - Smart contract documentation
- `dashboard/README.md` - Frontend documentation
- Performance benchmarks available via `npm run benchmark`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🌟 Monad Blitz Bangalore

This project was built for the Monad Blitz Bangalore hackathon, demonstrating the power of serverless computing on the Monad blockchain.

**Team**: MonadFaas  
**Track**: DeFi Infrastructure  
**Status**: ✅ Successfully deployed and operational
