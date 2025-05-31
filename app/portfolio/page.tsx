"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, WalletIcon, Copy, PieChartIcon } from "lucide-react"
import Link from "next/link"
import PortfolioChartTab from "@/app/components/user-profile/portfolio-chart-tab"
import { useAuth } from "@/hooks/use-auth"
import type { WatchlistUser } from "@/lib/types" // For user type if we fetch full user
import { toast } from "@/components/ui/use-toast"

export default function PortfolioPage() {
  const { userId, isLoading: authLoading, isAuthenticated } = useAuth()
  const [user, setUser] = useState<WatchlistUser | null>(null) // To store user data including connectedAddresses
  const [loadingUser, setLoadingUser] = useState(true)
  const [selectedWallet, setSelectedWallet] = useState<string>("all")

  useEffect(() => {
    if (userId && isAuthenticated) {
      setLoadingUser(true)
      fetch(`/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
            if (data.user.connectedAddresses?.length === 1) {
              setSelectedWallet(data.user.connectedAddresses[0])
            } else {
              setSelectedWallet("all")
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingUser(false))
    } else if (!authLoading) {
      setLoadingUser(false) // Not authenticated or no userId
    }
  }, [userId, isAuthenticated, authLoading])

  const copyToClipboard = (text: string, label = "Address") => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${label} Copied!`,
      description: text,
    })
  }

  if (authLoading || loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !userId) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center text-white mb-6 hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <Card className="bg-gray-900 border-gray-800 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-white text-lg">Please connect your wallet to view your portfolio.</p>
              <Button asChild className="mt-6 bg-white text-black hover:bg-gray-200">
                <Link href="/">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center text-white mb-6 hover:text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="bg-gray-900 border-gray-800 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PieChartIcon className="h-8 w-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">My Portfolio</h1>
              </div>
              {user && user.connectedAddresses && user.connectedAddresses.length > 0 && (
                <div className="max-w-xs">
                  <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <div className="flex items-center justify-between w-full">
                        <WalletIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Select Wallet" />
                        {selectedWallet && selectedWallet !== "all" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(selectedWallet, "Selected Wallet Address")
                            }}
                            className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                            aria-label={`Copy selected wallet address ${selectedWallet}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {user.connectedAddresses.length > 1 && (
                        <SelectItem value="all" className="text-white hover:bg-gray-700">
                          All Connected Wallets
                        </SelectItem>
                      )}
                      {user.connectedAddresses.map((addr) => (
                        <div key={addr} className="flex items-center justify-between pr-2 hover:bg-gray-700 rounded-md">
                          <SelectItem
                            value={addr}
                            className="text-white font-mono text-xs flex-grow data-[state=checked]:bg-purple-600 data-[highlighted]:bg-gray-700"
                            style={{ paddingRight: "8px" }}
                          >
                            {addr.slice(0, 6)}...{addr.slice(-4)}
                          </SelectItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(addr, "Wallet Address")
                            }}
                            className="p-1 h-auto text-gray-400 hover:text-white"
                            aria-label={`Copy wallet address ${addr}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <PortfolioChartTab userId={userId} selectedWallet={selectedWallet} />
      </div>
    </div>
  )
}
