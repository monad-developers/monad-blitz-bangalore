import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { Chain } from "viem";

// Define Monad network
const monad = {
  id: 1_337,
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: { http: ["https://rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://scan.monad.xyz" },
  },
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: "GriffinLock.mon",
  projectId: "YOUR_PROJECT_ID", // Get this from WalletConnect Cloud
  chains: [monad, mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
