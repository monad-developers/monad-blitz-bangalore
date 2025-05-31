# 🟢 GreenGrid - Scaffold-ETH 2 on Monad

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Scaffold-ETH 2 Docs</a> |
  <a href="https://docs.monad.xyz">Monad Docs</a> |
  <a href="./MONAD_SETUP.md">Monad Setup Guide</a>
</h4>

🧪 A Scaffold-ETH 2 application pre-configured for **Monad Testnet**. An open-source, up-to-date toolkit for building decentralized applications (dapps) on Monad blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts on Monad.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.
🌐 **Configured for Monad Testnet** (Chain ID: 10143)

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Monad network.
- 🌟 **Monad Testnet Ready**: Pre-configured for Monad's high-performance blockchain.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## 🌐 Monad Network Information

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet.monadexplorer.com
- **Native Token**: MON

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with GreenGrid on Monad, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
yarn install
```

2. Run a local network in the first terminal (optional for local testing):

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/hardhat/hardhat.config.ts`.

3. On a second terminal, deploy the test contract to Monad Testnet:

```
yarn deploy --network monadTestnet
```

Or for local testing:
```
yarn deploy
```

This command deploys a test smart contract to the Monad Testnet. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. The app is pre-configured to work with Monad Testnet. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contracts in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/hardhat/deploy`

## 💰 Getting Testnet MON Tokens

To interact with contracts on Monad Testnet, you'll need MON tokens:

1. Visit the [Monad Testnet Hub](https://testnet.monad.xyz)
2. Connect your wallet to Monad Testnet
3. Request testnet MON tokens from the faucet

## 📚 Documentation

- **Monad Setup Guide**: [MONAD_SETUP.md](./MONAD_SETUP.md) - Comprehensive guide for Monad-specific setup
- **Scaffold-ETH 2**: Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2
- **Monad Documentation**: [docs.monad.xyz](https://docs.monad.xyz)
- **Features**: Check out the [Scaffold-ETH 2 website](https://scaffoldeth.io) to know more about its features

## 🛠 Key Differences for Monad

This project has been specifically configured for Monad:

1. **Network Configuration**: Hardhat is set up with Monad Testnet (Chain ID: 10143)
2. **Frontend Chain**: Custom Monad chain definition in the frontend
3. **Target Network**: Frontend defaults to Monad Testnet instead of localhost
4. **Explorer Integration**: Configured to work with Monad Explorer
5. **Wallet Integration**: Supports standard wallets on Monad network

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
