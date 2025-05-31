"use client"

import { useState } from "react"
import { Copy, ExternalLink, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SwapModal from "./swap-modal"
import type { Notification, Transaction } from "@/lib/types" // Ensure Transaction is imported
import { tokenRegistry } from "@/lib/dex-integration"

// Add an interface for original trade context
export interface OriginalTradeContext {
  copiedFromTraderId: string
  copiedFromTraderDisplayName: string
  copiedFromTraderPfpUrl?: string
  originalTxHash: string
  originalInputTokenSymbol: string
  originalInputTokenAddress: string
  originalInputTokenAmount: string
  originalOutputTokenSymbol: string
  originalOutputTokenAddress: string
  originalOutputTokenAmount: string
}

interface CopyTradeModalProps {
  isOpen: boolean
  onClose: () => void
  notification: Notification | null // Notification contains the rich Transaction object
}

export default function CopyTradeModal({ isOpen, onClose, notification }: CopyTradeModalProps) {
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [copyPercentage, setCopyPercentage] = useState(100)

  if (!notification) return null

  const originalTx = notification.transaction as Transaction // Cast to full Transaction type

  // Determine default tokens for the swap modal based on the original transaction
  let defaultInputTokenSymbolForSwap = "MON" // Default to MON
  let defaultOutputTokenSymbolForSwap = originalTx.tokenSymbol || "USDC" // Default to original token or USDC
  let tradeAmountForSwap = originalTx.value // This is native value, might need adjustment

  if (originalTx.action === "swap" && originalTx.inputTokenSymbol && originalTx.outputTokenSymbol) {
    defaultInputTokenSymbolForSwap = originalTx.inputTokenSymbol
    defaultOutputTokenSymbolForSwap = originalTx.outputTokenSymbol
    // If we had originalTx.inputTokenAmount, we'd use it here.
    // For now, if it's a swap, the originalTx.value (native MON) might not be the primary amount.
    // This part needs refinement once inputTokenAmount is reliably parsed.
    // If originalTx.value is "0" for a swap, we might need another source for amount.
    // For simplicity, let's assume if input is MON (WMON), originalTx.value is relevant.
    if (
      originalTx.inputTokenAddress?.toLowerCase() === tokenRegistry.getTokenBySymbol("MON")?.address.toLowerCase() ||
      originalTx.inputTokenAddress?.toLowerCase() === tokenRegistry.getTokenBySymbol("WMON")?.address.toLowerCase()
    ) {
      tradeAmountForSwap = originalTx.value // Use native value if input was MON/WMON
    } else if (originalTx.inputTokenAmount) {
      tradeAmountForSwap = originalTx.inputTokenAmount // Ideal case
    } else {
      tradeAmountForSwap = "1" // Fallback to a small amount if unclear
      console.warn("CopyTradeModal: Could not determine original trade amount for swap, defaulting to 1")
    }
  } else if (originalTx.action === "buy") {
    // Original heuristic, might be less common now
    defaultInputTokenSymbolForSwap = "MON"
    defaultOutputTokenSymbolForSwap = originalTx.tokenSymbol || "USDC"
    tradeAmountForSwap = originalTx.value
  } else if (originalTx.action === "sell") {
    // Original heuristic
    defaultInputTokenSymbolForSwap = originalTx.tokenSymbol || "USDC"
    defaultOutputTokenSymbolForSwap = "MON"
    tradeAmountForSwap = originalTx.value // This would be amount of tokenSymbol sold
  }

  const handleCopyTrade = () => {
    setShowSwapModal(true)
  }

  const getActionIcon = () => {
    switch (originalTx.action) {
      case "buy":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "sell":
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case "swap":
        return <RefreshCw className="h-5 w-5 text-blue-400" />
      default:
        return <TrendingUp className="h-5 w-5 text-gray-400" />
    }
  }

  const getActionColor = () => {
    switch (originalTx.action) {
      case "buy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "sell":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "swap":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const displayTokenSymbol =
    originalTx.tokenSymbol ||
    (originalTx.action === "swap" ? `${originalTx.inputTokenSymbol} → ${originalTx.outputTokenSymbol}` : "N/A")
  const displayAmount =
    originalTx.action === "swap"
      ? `${originalTx.inputTokenAmount || originalTx.value} ${originalTx.inputTokenSymbol || (originalTx.value !== "0" ? "MON" : "")}`
      : `${originalTx.value} ${originalTx.tokenSymbol || "MON"}`

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Copy Trade
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Copy this trade from {notification.traderDisplayName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Trader Info - remains the same */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={notification.traderPfp || "/placeholder.svg"}
                      alt={notification.traderDisplayName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {notification.traderDisplayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{notification.traderDisplayName}</h3>
                      <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">Trader</Badge>
                    </div>
                    <p className="text-sm text-gray-400">@{notification.traderUsername}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getActionIcon()}
                  Original Transaction ({originalTx.parsedMethodName || originalTx.action})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Action</span>
                  <Badge className={getActionColor()}>{originalTx.action.toUpperCase()}</Badge>
                </div>

                {originalTx.action === "swap" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">From Token</span>
                      <span className="text-white font-medium">{originalTx.inputTokenSymbol || "N/A"}</span>
                    </div>
                    {originalTx.inputTokenAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">From Amount</span>
                        <span className="text-white font-medium">{originalTx.inputTokenAmount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">To Token</span>
                      <span className="text-white font-medium">{originalTx.outputTokenSymbol || "N/A"}</span>
                    </div>
                    {originalTx.outputTokenAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">To Amount</span>
                        <span className="text-white font-medium">{originalTx.outputTokenAmount}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Token</span>
                      <span className="text-white font-medium">{originalTx.tokenSymbol || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Amount</span>
                      <span className="text-white font-medium">
                        {originalTx.value} {originalTx.tokenSymbol === "MON" ? "MON" : ""}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Router</span>
                  <span className="text-white font-mono text-xs truncate max-w-[150px]">
                    {originalTx.dexRouterAddress || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Block</span>
                  <span className="text-white font-mono text-sm">{originalTx.blockNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Copy Trade Settings */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Copy Trade Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="copy-percentage" className="text-sm text-gray-300">
                    Copy Percentage (of original value if applicable)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map((percentage) => (
                      <Button
                        key={percentage}
                        variant={copyPercentage === percentage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCopyPercentage(percentage)}
                        className="text-xs"
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                  <Input
                    id="copy-percentage"
                    type="number"
                    value={copyPercentage}
                    onChange={(e) => setCopyPercentage(Number.parseInt(e.target.value) || 100)}
                    className="mt-2 bg-gray-700 border-gray-600"
                    min="1"
                    max="500" // Allow > 100% if user wants to trade more
                  />
                </div>
                <div>
                  <Label htmlFor="copy-amount" className="text-sm text-gray-300">
                    Your Estimated Trade Amount
                  </Label>
                  <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                    <div className="text-lg font-medium text-white">
                      {((Number.parseFloat(tradeAmountForSwap) * copyPercentage) / 100).toFixed(6)}{" "}
                      {defaultInputTokenSymbolForSwap}
                    </div>
                    <div className="text-sm text-gray-400">
                      {copyPercentage}% of original trade value ({Number.parseFloat(tradeAmountForSwap).toFixed(6)}{" "}
                      {defaultInputTokenSymbolForSwap})
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-gray-800 border-gray-700 text-white">
                Cancel
              </Button>
              <Button
                onClick={handleCopyTrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Proceed to Swap
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Modal */}
      {showSwapModal && notification && originalTx && (
        <SwapModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          defaultInputToken={defaultInputTokenSymbolForSwap}
          defaultOutputToken={defaultOutputTokenSymbolForSwap}
          defaultAmount={((Number.parseFloat(tradeAmountForSwap) * copyPercentage) / 100).toString()}
          // Pass original trade context for saving later
          originalTradeContext={{
            copiedFromTraderId: notification.traderId,
            copiedFromTraderDisplayName: notification.traderDisplayName,
            copiedFromTraderPfpUrl: notification.traderPfp,
            originalTxHash: originalTx.hash,
            // These are from the ORIGINAL transaction by the TRADER
            originalInputTokenSymbol:
              originalTx.inputTokenSymbol || (originalTx.action !== "swap" && originalTx.value !== "0" ? "MON" : "N/A"),
            originalInputTokenAddress:
              originalTx.inputTokenAddress ||
              (originalTx.action !== "swap" && originalTx.value !== "0"
                ? tokenRegistry.getTokenBySymbol("MON")?.address || "0x0"
                : "0x0"),
            originalInputTokenAmount:
              originalTx.inputTokenAmount || (originalTx.action !== "swap" ? originalTx.value : "0"),
            originalOutputTokenSymbol: originalTx.outputTokenSymbol || "N/A",
            originalOutputTokenAddress: originalTx.outputTokenAddress || "0x0",
            originalOutputTokenAmount: originalTx.outputTokenAmount || "0",
          }}
          // Pass current user's ID for saving the trade record
          currentUserId={notification.userId} // Assuming notification.userId is the current user
        />
      )}
    </>
  )
}
