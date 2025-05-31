"use client"

import type React from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider } from "connectkit"
import { config } from "@/lib/wallet-config"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="minimal"
          mode="dark"
          options={{
            initialChainId: 41454, // Monad testnet
            enforceSupportedChains: false,
            disclaimer: "By connecting your wallet, you agree to our Terms of Service.",
          }}
          customTheme={{
            "--ck-connectbutton-font-size": "16px",
            "--ck-connectbutton-border-radius": "12px",
            "--ck-connectbutton-color": "#000000",
            "--ck-connectbutton-background": "#ffffff",
            "--ck-connectbutton-box-shadow": "0 4px 12px rgba(255, 255, 255, 0.2)",
            "--ck-connectbutton-hover-background": "#f0f0f0",

            // Modal styling
            "--ck-modal-background": "rgba(0, 0, 0, 0.95)",
            "--ck-modal-box-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            "--ck-body-background": "rgba(0, 0, 0, 0.95)",
            "--ck-body-background-secondary": "rgba(255, 255, 255, 0.1)",
            "--ck-body-background-tertiary": "rgba(255, 255, 255, 0.05)",

            // QR Code styling - CRITICAL FIX
            "--ck-qr-background": "#ffffff",
            "--ck-qr-dot-color": "#000000",
            "--ck-qr-border-color": "#e5e5e5",

            // Border radius
            "--ck-tertiary-border-radius": "16px",
            "--ck-border-radius": "16px",

            // Button styling
            "--ck-primary-button-background": "#ffffff",
            "--ck-primary-button-hover-background": "#f0f0f0",
            "--ck-primary-button-color": "#000000",
            "--ck-secondary-button-background": "rgba(255, 255, 255, 0.1)",
            "--ck-secondary-button-hover-background": "rgba(255, 255, 255, 0.15)",
            "--ck-secondary-button-color": "#ffffff",

            // Text colors
            "--ck-body-color": "#ffffff",
            "--ck-body-color-muted": "rgba(255, 255, 255, 0.7)",
            "--ck-body-color-muted-hover": "rgba(255, 255, 255, 0.8)",
            "--ck-body-color-subtle": "rgba(255, 255, 255, 0.5)",
            "--ck-body-divider": "rgba(255, 255, 255, 0.1)",

            // Focus states
            "--ck-focus-color": "#ffffff",
            "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",

            // Wallet option styling
            "--ck-body-background-transparent": "rgba(255, 255, 255, 0.05)",
            "--ck-body-background-secondary-hover-background": "rgba(255, 255, 255, 0.15)",
            "--ck-body-background-secondary-hover-outline": "rgba(255, 255, 255, 0.2)",

            // Additional QR code container styling
            "--ck-qr-border-radius": "12px",
            "--ck-qr-margin": "16px",
            "--ck-qr-padding": "16px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}