'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, monadTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import React from 'react';

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [monadTestnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(mainnet.rpcUrls.default.http[0]),
      [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
    },

    // Required API Keys
    walletConnectProjectId: process.env.PROJECT_ID!,

    // Required App Info
    appName: 'ModAI',

    // Optional App Info
    appDescription: 'Talk to monad',
    appUrl: 'https://family.co',
    appIcon: 'https://family.co/logo.png',
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
