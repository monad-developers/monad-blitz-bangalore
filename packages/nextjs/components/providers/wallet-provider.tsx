"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnected: boolean
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        setAddress(accounts[0])
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null)
      })
    }
  }, [])

  return (
    <WalletContext.Provider value={{
      address,
      connect,
      disconnect,
      isConnected: !!address
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)