# MonadFaas - Serverless Functions on Monad

A decentralized serverless platform built for the Monad blockchain ecosystem. Deploy, manage, and execute serverless functions with event-driven triggers using real MON tokens.

## 🚀 **Successfully Deployed on Monad Testnet!**

**Contract Address**: `0x4142d9Ad70f87c359260e6dC41340af5823BC888`  
**Network**: Monad Testnet (Chain ID: 10143)  
**Status**: ✅ Live and Operational

## ✨ Features

- 🔗 **Real Blockchain Integration** - Uses actual MON tokens for gas fees
- ⚡ **Event-Driven Architecture** - Price triggers, webhooks, time-based events
- 🎯 **Serverless Functions** - Deploy JavaScript/WASM functions on-chain
- 📊 **Web Dashboard** - Modern React interface for function management
- 🛠️ **CLI Tools** - Command-line interface for developers
- 🔄 **Parallel Execution** - Multiple functions execute simultaneously
- 💰 **Gas Optimized** - Efficient smart contract design

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

# Install dependencies
npm install
cd dashboard && npm install
cd ../cli && npm install
```

### 2. Configure Environment
```bash
# Copy and edit environment file
cp .env.example .env

# Add your private key
PRIVATE_KEY=0xYourPrivateKeyHere
```

### 3. Verify Setup
```bash
node verify-setup.js
```

### 4. Run Demo
```bash
# Run a single function demo
node demo-script.js --functions=1

# Run larger scale demo
node demo-script.js --functions=10
```

## 🎮 Demo Scripts

### Live Testnet Demo
```bash
# Single function test
node demo-script.js --functions=1

# Scale test with multiple functions
node demo-script.js --functions=20
```

### Local Development Demo
```bash
# Requires local Anvil blockchain
node demo-local.js --functions=5
```

### Optimized Gas Demo
```bash
# Demonstrates gas optimization features
node optimized-demo.js --functions=10
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

## 🛠️ CLI Interface

Use the command-line interface for developer workflows:

```bash
cd cli

# Initialize new function
npm run dev -- init my-function

# Build function
npm run dev -- build

# Deploy function
npm run dev -- deploy

# Check status
npm run dev -- status
```

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

# CLI tests
cd cli
npm test
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

- `PRESENTATION_GUIDE.txt` - Demo presentation guide
- `QUICK_REFERENCE.txt` - Essential commands reference
- `contracts/README.md` - Smart contract documentation
- `dashboard/README.md` - Frontend documentation

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
