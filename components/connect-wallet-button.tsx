"use client"

import { ConnectKitButton } from "connectkit"
import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount, useEnsName, useEnsAvatar, useDisconnect } from "wagmi"
import { monadTestnet } from "@/lib/wallet-config"

export function ConnectWalletButton() {
  const { address, isConnected, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName })
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = () => {
    if (chain?.id === monadTestnet.id) {
      window.open(`https://testnet.monadexplorer.com/address/${address}`, "_blank")
    } else {
      window.open(`https://etherscan.io/address/${address}`, "_blank")
    }
  }

  const getNetworkColor = () => {
    if (chain?.id === monadTestnet.id) {
      return "bg-white/20 text-white border-white/30"
    }
    return "bg-gray-800 text-white border-gray-700"
  }

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address, ensName, chain }) => {
        if (isConnected && address) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} />
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{ensName || formatAddress(address)}</span>
                    <Badge variant="secondary" className={`text-xs ${getNetworkColor()}`}>
                      {chain?.name || "Unknown"}
                    </Badge>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-800 shadow-xl">
                <div className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{ensName || formatAddress(address)}</p>
                      <p className="text-xs text-gray-400">Connected to {chain?.name}</p>
                    </div>
                  </div>

                  {chain?.id !== monadTestnet.id && (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-2 mb-2">
                      <p className="text-xs text-white">Switch to Monad Testnet for full functionality</p>
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={() => copyToClipboard(address)}
                  className="text-white hover:bg-gray-800 cursor-pointer"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>

                <DropdownMenuItem onClick={openInExplorer} className="text-white hover:bg-gray-800 cursor-pointer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Explorer
                </DropdownMenuItem>

                <DropdownMenuItem onClick={show} className="text-white hover:bg-gray-800 cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Wallet Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem onClick={() => disconnect()} className="text-white hover:bg-gray-800 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        return (
          <Button
            onClick={show}
            disabled={isConnecting}
            className="bg-white hover:bg-gray-200 border-0 text-black shadow-lg"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}
