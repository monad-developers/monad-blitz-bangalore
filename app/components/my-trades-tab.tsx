"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, Repeat, Clock, ArrowRight } from "lucide-react"
import type { ExecutedCopyTrade } from "@/lib/types"
import { monadTestnet } from "@/lib/wallet-config"

interface MyTradesTabProps {
  currentUser: string // User ID of the currently logged-in user
}

export default function MyTradesTab({ currentUser }: MyTradesTabProps) {
  const [myTrades, setMyTrades] = useState<ExecutedCopyTrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      setMyTrades([]) // Clear trades if no user
      return
    }

    setLoading(true)
    fetch(`/api/users/${currentUser}/my-trades`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch trades: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.trades) {
          setMyTrades(data.trades)
        } else {
          setMyTrades([])
        }
      })
      .catch((error) => {
        console.error("Error fetching my trades:", error)
        setMyTrades([]) // Clear trades on error
        // Optionally, set an error state to display to the user
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentUser]) // Re-fetch when currentUser changes

  const openInExplorer = (hash: string) => {
    window.open(`${monadTestnet.blockExplorers.default.url}/tx/${hash}`, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-gray-300 mt-2">Loading your trades...</p>
        </CardContent>
      </Card>
    )
  }

  if (myTrades.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <p className="text-gray-300">No copy trades executed yet.</p>
          <p className="text-sm text-gray-400 mt-2">When you copy a trade, it will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">My Executed Copy Trades</CardTitle>
          <CardDescription className="text-gray-300">
            A history of trades you've copied from other users.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {myTrades.map((trade) => (
          <Card
            key={trade.id}
            className="bg-gray-900 border-gray-800 shadow-xl hover:bg-gray-800/70 transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Trade Details */}
                  <div className="flex items-center gap-3 text-lg">
                    <span className="font-medium text-white">{trade.inputTokenAmount}</span>
                    <Badge variant="outline" className="text-sm bg-gray-700 border-gray-600 text-gray-300">
                      {trade.inputTokenSymbol}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-white">{trade.outputTokenAmount}</span>
                    <Badge variant="outline" className="text-sm bg-gray-700 border-gray-600 text-gray-300">
                      {trade.outputTokenSymbol}
                    </Badge>
                  </div>

                  {/* Copied From Info */}
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Copied from:</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={trade.copiedFromTraderPfpUrl || "/placeholder.svg"}
                        alt={trade.copiedFromTraderDisplayName}
                      />
                      <AvatarFallback className="text-xs bg-gray-700">
                        {trade.copiedFromTraderDisplayName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white text-sm">{trade.copiedFromTraderDisplayName}</span>
                  </div>

                  {/* Timestamp and Links */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(trade.timestamp).toLocaleString()}</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => openInExplorer(trade.copyTxHash)}
                      className="p-0 h-auto text-xs text-blue-400 hover:text-blue-300"
                    >
                      View Your Tx <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => openInExplorer(trade.originalTxHash)}
                      className="p-0 h-auto text-xs text-gray-500 hover:text-gray-400"
                    >
                      Original Tx <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Executed</Badge>
                  <span className="text-xs text-gray-500 font-mono">
                    ID: {trade.copyTxHash.slice(0, 6)}...{trade.copyTxHash.slice(-4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
