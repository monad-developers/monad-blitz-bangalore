import { getDefaultConfig } from "connectkit"
import { createConfig } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

// Define Monad testnet
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    public: { http: ["https://testnet-rpc.monad.xyz"] },
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://testnet-explorer.monad.xyz" },
  },
  testnet: true,
} as const

export const config = createConfig(
  getDefaultConfig({
    // Your dApp details
    appName: "Social Signals",
    appDescription: "Turn your Farcaster feed into alpha",
    appUrl: "https://social-signals.vercel.app",
    appIcon: "https://social-signals.vercel.app/icon.png",

    // WalletConnect Project ID
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required chains
    chains: [monadTestnet, mainnet, sepolia],

    // Optional
    ssr: true,
  }),
)
