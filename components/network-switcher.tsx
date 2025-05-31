"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Plus } from "lucide-react"
import { useAccount, useSwitchChain } from "wagmi"
import { monadTestnet } from "@/lib/wallet-config"
import { useState } from "react"

export function NetworkSwitcher() {
  const { chain, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()
  const [isAdding, setIsAdding] = useState(false)

  if (!isConnected) return null

  const isOnMonad = chain?.id === monadTestnet.id

  const addMonadNetwork = async () => {
    if (!window.ethereum) return

    setIsAdding(true)
    try {
      // First try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
      })
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${monadTestnet.id.toString(16)}`,
                chainName: monadTestnet.name,
                nativeCurrency: monadTestnet.nativeCurrency,
                rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
                blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
              },
            ],
          })
        } catch (addError) {
          console.error("Failed to add network:", addError)
        }
      } else {
        console.error("Failed to switch network:", switchError)
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      // First try using wagmi's switchChain
      await switchChain({ chainId: monadTestnet.id })
    } catch (error) {
      // If that fails, try adding the network manually
      await addMonadNetwork()
    }
  }

  if (isOnMonad) {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Monad Testnet
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Wrong Network
      </Badge>
      <Button
        size="sm"
        onClick={handleSwitchNetwork}
        disabled={isPending || isAdding}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 text-white text-xs px-3 py-1 h-7"
      >
        {isPending || isAdding ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1" />
            {isAdding ? "Adding..." : "Switching..."}
          </>
        ) : (
          <>
            <Plus className="h-3 w-3 mr-1" />
            Add Monad
          </>
        )}
      </Button>
    </div>
  )
}