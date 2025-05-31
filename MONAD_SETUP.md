# 🟢 GreenGrid - Scaffold-ETH 2 on Monad

This project is a Scaffold-ETH 2 application configured for **Monad Testnet**. It provides a full-stack development environment for building dApps on Monad.

## 🌐 Monad Network Information

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet.monadexplorer.com
- **Native Token**: MON
- **Decimals**: 18

## 🏗 Scaffold-ETH 2 + Monad Setup

### Prerequisites
- Node.js (v18 or later)
- Yarn package manager
- Git

### Quick Start

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Start the local development blockchain** (optional - for local testing):
   ```bash
   yarn chain
   ```

3. **Deploy contracts to Monad Testnet**:
   ```bash
   yarn deploy --network monadTestnet
   ```
   
   Or for local testing:
   ```bash
   yarn deploy
   ```

4. **Start the NextJS frontend**:
   ```bash
   yarn start
   ```

5. **Run tests**:
   ```bash
   yarn hardhat:test
   ```

## 🔧 Configuration

### Hardhat Configuration
The Hardhat configuration (`packages/hardhat/hardhat.config.ts`) includes:
- Monad Testnet network configuration
- Proper chain ID (10143)
- Monad RPC endpoint
- Explorer verification settings

### Frontend Configuration
The frontend is configured in `packages/nextjs/scaffold.config.ts` to:
- Target Monad Testnet by default
- Use the custom Monad chain definition
- Disable local-only burner wallet (to work with Monad)

## 🔐 Private Key Management

**⚠️ IMPORTANT**: Replace the default private key for mainnet/testnet deployments!

1. **Generate a new account**:
   ```bash
   yarn generate
   ```

2. **Import existing private key**:
   ```bash
   yarn account:import
   ```

3. **Set environment variable**:
   ```bash
   export __RUNTIME_DEPLOYER_PRIVATE_KEY="your_private_key_here"
   ```

## 💰 Getting Testnet MON Tokens

To interact with contracts on Monad Testnet, you'll need MON tokens:

1. Visit the [Monad Testnet Hub](https://testnet.monad.xyz)
2. Connect your wallet
3. Request testnet MON tokens from the faucet

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn chain` | Start local Hardhat network |
| `yarn fork` | Start local fork of Ethereum mainnet |
| `yarn deploy` | Deploy contracts to local network |
| `yarn deploy --network monadTestnet` | Deploy to Monad Testnet |
| `yarn verify --network monadTestnet` | Verify contracts on Monad |
| `yarn start` | Start NextJS frontend |
| `yarn lint` | Lint TypeScript code |
| `yarn hardhat:test` | Run Hardhat tests |

## 🏗 Contract Development

### Sample Contract
The project includes a sample contract (`YourContract.sol`) that demonstrates:
- Basic Solidity patterns
- State management
- Events and modifiers
- Monad-compatible development

### Deployment
Contracts are deployed using Hardhat Deploy:
- Deploy scripts are in `packages/hardhat/deploy/`
- Network-specific deployments handled automatically
- Contract ABIs auto-generated for frontend

## 🎨 Frontend Features

- **Wallet Integration**: Connect to MetaMask, WalletConnect, and other wallets
- **Contract Interaction**: Auto-generated UI for contract functions
- **Block Explorer**: View transactions and contracts
- **Debug Tools**: Built-in debugging and testing utilities
- **Responsive Design**: Mobile-friendly interface

## 📚 Monad-Specific Resources

- [Monad Documentation](https://docs.monad.xyz)
- [Monad Testnet Explorer](https://testnet.monadexplorer.com)
- [Monad Ecosystem](https://www.monad.xyz/ecosystem)
- [Monad GitHub](https://github.com/monad-labs)

## 🛠 Troubleshooting

### Common Issues

1. **RPC Connection Issues**:
   - Verify Monad Testnet RPC is accessible
   - Check network connectivity
   - Try alternative RPC endpoints if needed

2. **Gas Estimation Errors**:
   - Ensure sufficient MON balance
   - Check contract for any reverts
   - Verify function parameters

3. **Contract Verification**:
   - Ensure contract is deployed successfully
   - Check explorer API endpoints
   - Verify network configuration

### Getting Help

- Check [Scaffold-ETH 2 Documentation](https://docs.scaffoldeth.io)
- Join [Monad Discord](https://discord.gg/monad)
- Review [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Building on Monad! 🚀** 