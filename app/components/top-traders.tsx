"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Loader2, Crown, Star, Wallet, Copy, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TopTrader {
  id: string
  username: string
  displayName: string
  avatar: string
  verified: boolean
  farcasterFid: number
  rank: number
  volume: number
  transactionCount: number
  avgTransactionSize: number
  percentageChange: number
  lastActivity: string
  isContract?: boolean
  walletAddress?: string
  holdingPercentage?: number
}

interface TopTradersResponse {
  traders: TopTrader[]
  period: string
  totalTraders: number
  isMockData: boolean
  message?: string
  error?: string
  dataSource?: string
}

interface TopTradersProps {
  limit?: number
}

export default function TopTraders({ limit = 5 }: TopTradersProps) {
  const [data, setData] = useState<TopTradersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopTraders()
  }, [limit])

  const fetchTopTraders = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/traders/top?limit=${limit}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const responseData = await response.json()

      if (responseData.error) {
        throw new Error(responseData.message || responseData.error)
      }

      setData(responseData)
    } catch (err) {
      console.error("Error fetching top holders:", err)
      setError(err instanceof Error ? err.message : "Failed to load holders")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)}B MON`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M MON`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K MON`
    } else {
      return `${amount.toFixed(2)} MON`
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-400" />
      case 2:
        return <Star className="h-4 w-4 text-gray-300" />
      case 3:
        return <Star className="h-4 w-4 text-amber-600" />
      default:
        return null
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const openInExplorer = (address: string) => {
    window.open(`https://testnet.monadexplorer.com/address/${address}`, "_blank")
  }

  if (loading) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Loading top holders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="text-center p-8">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchTopTraders} className="mt-2 text-white/70 hover:text-white text-xs underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.traders.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="text-center p-8">
          <p className="text-gray-300">No holder data available</p>
          <button onClick={fetchTopTraders} className="mt-2 text-white/70 hover:text-white text-xs underline">
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Top Monad Holders</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Source: {data.dataSource || "BlockVision"}</span>
          <button onClick={fetchTopTraders} className="text-white/70 hover:text-white">
            <Loader2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.traders.map((holder) => (
          <div
            key={holder.id}
            className="flex items-center justify-between p-3 bg-neutral-900/80 rounded-lg border border-neutral-700/60 hover:bg-neutral-800/80 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-neutral-800/80 rounded-full flex items-center justify-center text-xs font-bold text-white border border-neutral-600/50">
                  {holder.rank}
                </div>
                {getRankIcon(holder.rank)}
              </div>

              <Avatar className="h-8 w-8">
                <AvatarImage src={holder.avatar || "/placeholder.svg"} alt={holder.displayName} />
                <AvatarFallback className="bg-neutral-700 text-white text-xs">
                  {holder.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm font-mono">{holder.displayName}</p>
                  {holder.isContract && (
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">Contract</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-xs">{holder.holdingPercentage?.toFixed(2)}% of supply</p>
                  <Wallet className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white font-medium text-sm">{formatAmount(holder.volume)}</p>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-purple-400" />
                  <span className="text-purple-400">{holder.holdingPercentage?.toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyAddress(holder.walletAddress || holder.id)}
                  className="h-7 w-7 p-0 bg-neutral-800/60 border-neutral-600/50 text-white hover:bg-neutral-700/60 hover:border-neutral-500/60 transition-all"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInExplorer(holder.walletAddress || holder.id)}
                  className="h-7 w-7 p-0 bg-neutral-800/60 border-neutral-600/50 text-white hover:bg-neutral-700/60 hover:border-neutral-500/60 transition-all"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
