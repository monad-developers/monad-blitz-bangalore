"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, TrendingUp, TrendingDown, ExternalLink, Clock, Copy, Filter } from "lucide-react"
import CopyTradeModal from "../copy-trade-modal"
import type { Transaction } from "@/lib/types"

interface TransactionsTabProps {
  userId: string
  selectedWallet?: string // Optional: specific wallet address to filter by
}

interface UserTransaction extends Transaction {
  id: string
  timestamp: number
}

export default function TransactionsTab({ userId, selectedWallet }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransactionForModal, setSelectedTransactionForModal] = useState<UserTransaction | null>(null)
  const [showCopyTradeModal, setShowCopyTradeModal] = useState(false)
  const [selectedTokenFilter, setSelectedTokenFilter] = useState<string>("All")

  const uniqueTokens = useMemo(() => {
    const tokens = new Set<string>()
    transactions.forEach((tx) => {
      if (tx.tokenSymbol) tokens.add(tx.tokenSymbol)
    })
    return ["All", ...Array.from(tokens)]
  }, [transactions])

  useEffect(() => {
    fetchTransactions()
  }, [userId, selectedWallet, selectedTokenFilter]) // Re-fetch if selectedWallet or tokenFilter changes

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      let apiUrl = `/api/users/${userId}/transactions?days=7`
      if (selectedWallet && selectedWallet !== "all") {
        apiUrl += `&walletAddress=${selectedWallet}`
      }
      if (selectedTokenFilter && selectedTokenFilter !== "All") {
        apiUrl += `&tokenSymbol=${selectedTokenFilter}`
      }

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions([]) // Clear transactions on error
    } finally {
      setLoading(false)
    }
  }

  const handleCopyTrade = (transaction: UserTransaction) => {
    setSelectedTransactionForModal(transaction)
    setShowCopyTradeModal(true)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <TrendingUp className="h-4 w-4 text-blue-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "buy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "sell":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const openInExplorer = (hash: string) => {
    window.open(`https://testnet.monadexplorer.com/tx/${hash}`, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-300">
                Trading activity over the last 7 days{" "}
                {selectedWallet && selectedWallet !== "all"
                  ? `for wallet ${selectedWallet.slice(0, 6)}...${selectedWallet.slice(-4)}`
                  : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedTokenFilter} onValueChange={setSelectedTokenFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by token" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {uniqueTokens.map((token) => (
                    <SelectItem key={token} value={token} className="text-white hover:bg-gray-700">
                      {token === "All" ? "All Tokens" : token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
              <p className="text-gray-300 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-300">No transactions found</p>
              <p className="text-sm text-gray-400 mt-2">
                {selectedTokenFilter !== "All"
                  ? `No transactions for ${selectedTokenFilter} in the last 7 days.`
                  : "This user hasn't made any transactions in the last 7 days."}
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <Card key={tx.hash} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionIcon(tx.action)}
                        <span className="font-medium text-white">{tx.action.toUpperCase()}</span>
                        <Badge className={getActionColor(tx.action)}>{tx.tokenSymbol || "ETH"}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-gray-400">Amount</p>
                          <p className="text-white font-medium">
                            {Number.parseFloat(tx.value).toFixed(4)} {tx.tokenSymbol || "ETH"}
                          </p>
                        </div>

                        {tx.tokenName && (
                          <div>
                            <p className="text-gray-400">Token</p>
                            <p className="text-white">{tx.tokenName}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-400">From</p>
                          <div className="flex items-center gap-1">
                            <p className="text-white font-mono text-xs">
                              {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyAddress(tx.from)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-white"
                              title="Copy full address"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400">To</p>
                          <div className="flex items-center gap-1">
                            <p className="text-white font-mono text-xs">
                              {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyAddress(tx.to)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-white"
                              title="Copy full address"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400">Block</p>
                          <p className="text-white font-mono text-xs">{tx.blockNumber}</p>
                        </div>

                        <div>
                          <p className="text-gray-400">Time</p>
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(tx.timestamp * 1000).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInExplorer(tx.hash)}
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Explorer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCopyTrade(tx)}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 disabled:opacity-50"
                        disabled // Add this prop
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Trade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Copy Trade Modal */}
      {selectedTransactionForModal && (
        <CopyTradeModal
          isOpen={showCopyTradeModal}
          onClose={() => setShowCopyTradeModal(false)}
          notification={{
            id: selectedTransactionForModal.id || selectedTransactionForModal.hash,
            userId: "",
            traderId: userId,
            traderUsername: "user",
            traderDisplayName: "Trader",
            traderPfp: "/placeholder.svg",
            transaction: selectedTransactionForModal,
            createdAt: new Date(selectedTransactionForModal.timestamp * 1000).toISOString(),
            read: true,
          }}
        />
      )}
    </>
  )
}
