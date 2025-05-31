# ChainJump 🎮⛓️

**ChainJump** is a decentralized hyper-casual platformer gaming platform built on the Monad blockchain. Create, publish, and play custom platformer games while earning cryptocurrency rewards. Fair, transparent, and community-driven gaming for everyone.

![ChainJump Banner](https://img.shields.io/badge/ChainJump-Blockchain%20Gaming-purple?style=for-the-badge)

## 🌟 Features

### 🎨 Game Creation Studio
- **Visual Level Editor**: Drag-and-drop level designer with 27x11 grid
- **Symbol Palette**: Complete set of game elements (platforms, enemies, coins, spikes, etc.)
- **Live Preview**: Real-time game testing with Kaboom.js engine
- **Preset Levels**: Load from existing game templates
- **Export/Import**: Save games as JSON files

### 🎮 Gaming Platform
- **Play-to-Earn**: Earn MONAD tokens by playing games
- **Multiple Game Modes**: Featured games, tournaments, and leaderboards
- **Wallet Integration**: Seamless MetaMask connection
- **Real-time Gameplay**: Smooth platformer mechanics with physics

### ⛓️ Blockchain Integration
- **Smart Contract Publishing**: Deploy games directly to Monad blockchain
- **Decentralized Storage**: Games stored on-chain for permanence
- **Cryptocurrency Rewards**: MONAD token economy
- **Transparent Gameplay**: Verifiable game mechanics and rewards

### 🏆 Community Features
- **Leaderboards**: Global player rankings [COMING SOON]
- **Tournaments**: Competitive gaming events [COMING SOON]
- **Creator Economy**: Game creators earn from player fees
- **Social Gaming**: Share and discover community-created games

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- MONAD testnet tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chainjump.git
   cd chainjump
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Wallet Setup

1. **Install MetaMask** browser extension
2. **Add Monad Testnet** network:
   - Network Name: `Monad Testnet`
   - RPC URL: `https://testnet-rpc.monad.xyz`
   - Chain ID: `10143`
   - Currency Symbol: `MONAD`
   - Block Explorer: `https://testnet.monadexplorer.com/`

3. **Get testnet tokens** from the Monad faucet

## 🎯 How to Use

### Playing Games

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Browse Games**: Explore featured games, tournaments, or leaderboards
3. **Pay Entry Fee**: Games require MONAD tokens to play
4. **Play & Earn**: Complete levels to earn rewards and climb leaderboards

### Creating Games

1. **Access Creator**: Navigate to `/create` page
2. **Design Levels**: Use the visual editor to create platformer levels
3. **Set Parameters**: Configure game name, difficulty, and entry fee
4. **Test Gameplay**: Use live preview to test your levels
5. **Publish to Blockchain**: Deploy your game as a smart contract

### Game Elements

| Symbol | Element | Description |
|--------|---------|-------------|
| `⬜` | Empty | Empty space |
| `🟩` | Grass Platform | Solid grass platform |
| `⬛` | Steel Platform | Steel platform |
| `🟫` | Bag Block | Solid bag block |
| `🪙` | Coin | Collectible coin |
| `📦` | Prize Block | Hit for power-ups |
| `🔺` | Spike | Dangerous spikes |
| `🍎` | Apple | Power-up apple |
| `👻` | Enemy | Moving enemy |
| `🌀` | Portal | Level exit portal |

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library
- **Kaboom.js**: Game engine for platformer mechanics

### Blockchain Stack
- **Monad Blockchain**: High-performance EVM-compatible chain
- **Ethers.js**: Ethereum library for smart contract interaction
- **MetaMask**: Wallet connection and transaction signing
- **Smart Contracts**: Game factory and individual game contracts

### Key Components

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage with featured games
│   ├── create/            # Game creation studio
│   ├── play/              # Game browser and tournaments
│   └── game/[gamekey]/    # Individual game player
├── lib/                   # Utility libraries
│   ├── wallet.ts          # Wallet connection logic
│   └── smartContract.ts   # Blockchain interaction
├── components/            # Reusable UI components
└── types/                 # TypeScript type definitions
```

## 🔧 Smart Contract Integration

### Game Factory Contract
- **Address**: `0x456F88C4A2F6dA77B78FB93AafD57306efaD186f`
- **Network**: Monad Testnet
- **Function**: `createGameWithLevelsAndCost(string gameName, string[][] levels, uint256 costOfPlay)`

### Publishing Flow
1. Game data formatted as `string[][]` arrays
2. Entry fee converted to wei (MONAD * 10^18)
3. Smart contract deployment via MetaMask transaction
4. Game becomes playable on the platform

## 🎮 Game Data Format

Games are stored as JSON with the following structure:

```json
{
  "0x001": {
    "Levels": {
      "LevelsCount": 4,
      "Levels": [
        [
          "    0       ",
          "   --       ",
          "       $$   ",
          " %    ===   ",
          "            ",
          "   ^^  > = @",
          "============"
        ]
      ]
    }
  }
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

- **Pages**: Next.js app router structure
- **Components**: Reusable UI components with Tailwind CSS
- **Lib**: Utility functions for wallet and smart contract interaction
- **Public**: Static assets including game sprites and level data

### Adding New Games

1. Create level data in `public/data/levels.json`
2. Add game metadata to featured games array
3. Ensure proper game key mapping

## 🎨 Assets

### Sprites
- Player character (bean)
- Platforms (grass, steel, bag)
- Collectibles (coins, apples)
- Enemies (ghosty)
- Hazards (spikes)
- Interactive elements (portals, prize blocks)

### Audio
- Background music
- Sound effects for actions
- Ambient game sounds

## 🌐 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure wallet integration works properly
- Test smart contract interactions on testnet
- Maintain responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Monad Testnet Explorer**: [https://testnet.monadexplorer.com/address/0x456F88C4A2F6dA77B78FB93AafD57306efaD186f?tab=Transaction&portfolio=Info](https://testnet.monadexplorer.com/address/0x456F88C4A2F6dA77B78FB93AafD57306efaD186f?tab=Transaction&portfolio=Info)



## 🙏 Acknowledgments

- **Monad Labs** for the high-performance blockchain
- **Kaboom.js** for the excellent game engine
- **Next.js** team for the amazing framework
- **Radix UI** for accessible components
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ for the Monad Hackathon**

*Create. Play. Win. On-chain.*
