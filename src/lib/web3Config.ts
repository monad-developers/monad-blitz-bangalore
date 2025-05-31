
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'GriffinLock.mon',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
