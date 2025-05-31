"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowUpDown, Settings, X, Loader2, AlertTriangle, CheckCircle, ExternalLink, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { tokenRegistry, type SwapQuote, KNOWN_CONTRACTS } from "@/lib/dex-integration"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useReadContract, useWriteContract } from "wagmi"
import { toast } from "@/components/ui/use-toast"
import { monadTestnet } from "@/lib/wallet-config"
import { useAuth } from "@/hooks/use-auth"
import { ethers } from "ethers" // For MaxUint256
import { parseUnits } from "viem"

const erc20ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]

interface OriginalTradeContext {
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

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
  defaultInputTokenSymbol?: string
  defaultOutputTokenSymbol?: string
  defaultAmount?: string
  originalTradeContext?: OriginalTradeContext
  currentUserId?: string
}

export default function SwapModal({
  isOpen,
  onClose,
  defaultInputTokenSymbol = "MON",
  defaultOutputTokenSymbol = "USDC",
  defaultAmount = "",
  originalTradeContext,
  currentUserId,
}: SwapModalProps) {
  const { address, isConnected, chain } = useAccount()
  const [inputTokenSymbol, setInputTokenSymbol] = useState(defaultInputTokenSymbol)
  const [outputTokenSymbol, setOutputTokenSymbol] = useState(defaultOutputTokenSymbol)
  const [inputAmount, setInputAmount] = useState(defaultAmount)
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [slippage, setSlippage] = useState(1.0)
  const [showSettings, setShowSettings] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n)
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)

  const {
    data: approvalHash,
    writeContractAsync: approveAsync,
    isPending: isApproving,
    error: approvalError,
  } = useWriteContract()
  const { isLoading: isConfirmingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  const { data: swapHash, sendTransaction, isPending: isSendingTx, error: sendTxError } = useSendTransaction()
  const {
    isLoading: isConfirmingSwap,
    isSuccess: isConfirmedSwap,
    error: confirmationSwapError,
  } = useWaitForTransactionReceipt({ hash: swapHash })

  const tokens = tokenRegistry.getAvailableTokens()
  const { userId: authUserId } = useAuth()

  const inputToken = tokenRegistry.getTokenBySymbol(inputTokenSymbol)
  const spenderAddress = KNOWN_CONTRACTS.UNISWAP_V2_ROUTER.address

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: inputToken?.address as `0x${string}` | undefined,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, spenderAddress as `0x${string}`],
    query: {
      enabled:
        !!inputToken &&
        inputToken.address !== KNOWN_CONTRACTS.NATIVE_MON.address &&
        !!address &&
        !!inputAmount &&
        Number.parseFloat(inputAmount) > 0,
    },
  })

  useEffect(() => {
    if (allowanceData !== undefined) {
      setCurrentAllowance(allowanceData as bigint)
    }
  }, [allowanceData])

  useEffect(() => {
    if (
      inputToken &&
      inputToken.address !== KNOWN_CONTRACTS.NATIVE_MON.address &&
      inputAmount &&
      Number.parseFloat(inputAmount) > 0
    ) {
      setIsCheckingAllowance(true)
      refetchAllowance?.().finally(() => setIsCheckingAllowance(false))
    } else {
      setNeedsApproval(false)
    }
  }, [inputTokenSymbol, inputAmount, address, refetchAllowance, inputToken])

  useEffect(() => {
    if (
      inputToken &&
      inputToken.address !== KNOWN_CONTRACTS.NATIVE_MON.address &&
      inputAmount &&
      Number.parseFloat(inputAmount) > 0
    ) {
      try {
        const requiredAmountRaw = parseUnits(inputAmount, inputToken.decimals)
        setNeedsApproval(currentAllowance < requiredAmountRaw)
      } catch (e) {
        console.error("Error parsing input amount for allowance check:", e)
        setNeedsApproval(false) // Default to no approval needed if parsing fails
      }
    } else {
      setNeedsApproval(false)
    }
  }, [currentAllowance, inputAmount, inputToken])

  const fetchQuote = useCallback(async () => {
    if (
      !inputAmount ||
      Number.parseFloat(inputAmount) <= 0 ||
      !inputTokenSymbol ||
      !outputTokenSymbol ||
      inputTokenSymbol === outputTokenSymbol
    ) {
      setQuote(null)
      setApiError(null)
      return
    }
    setIsLoadingQuote(true)
    setApiError(null)
    try {
      const response = await fetch(
        `/api/dex/quote?inputToken=${inputTokenSymbol}&outputToken=${outputTokenSymbol}&inputAmount=${inputAmount}`,
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to fetch quote")
      }
      setQuote(data.quote)
    } catch (error) {
      console.error("Error getting quote:", error)
      setApiError(error instanceof Error ? error.message : "Could not fetch quote.")
      setQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [inputAmount, inputTokenSymbol, outputTokenSymbol])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  // Effect for successful approval
  useEffect(() => {
    if (isApproved && approvalHash) {
      toast({
        title: "Approval Successful!",
        description: `${inputTokenSymbol} approved for swapping.`,
        action: <CheckCircle className="text-green-500" />,
      })
      refetchAllowance?.() // Re-check allowance, should now be sufficient
      setNeedsApproval(false) // Optimistically update
    }
    if (approvalError) {
      toast({
        title: "Approval Failed",
        description: approvalError.message.substring(0, 100) + "...",
        variant: "destructive",
      })
    }
  }, [isApproved, approvalHash, approvalError, inputTokenSymbol, refetchAllowance])

  // Effect for successful swap
  useEffect(() => {
    if (isConfirmedSwap && swapHash) {
      toast({
        title: "Swap Successful!",
        description: (
          <div className="flex flex-col gap-1">
            <p>Your transaction has been confirmed.</p>
            <a
              href={`${monadTestnet.blockExplorers.default.url}/tx/${swapHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
            >
              View on Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ),
        action: <CheckCircle className="text-green-500" />,
      })

      if (originalTradeContext && (currentUserId || authUserId)) {
        const finalUserId = currentUserId || authUserId
        if (!finalUserId) {
          console.error("User ID not available to save copy trade.")
          return
        }
        const inputTokenDetails = tokenRegistry.getTokenBySymbol(inputTokenSymbol)
        const outputTokenDetails = tokenRegistry.getTokenBySymbol(outputTokenSymbol)
        const executedTradeData = {
          copiedFromTraderId: originalTradeContext.copiedFromTraderId,
          copiedFromTraderDisplayName: originalTradeContext.copiedFromTraderDisplayName,
          copiedFromTraderPfpUrl: originalTradeContext.copiedFromTraderPfpUrl,
          originalTransactionHash: originalTradeContext.originalTxHash,
          copyTransactionHash: swapHash,
          inputTokenSymbol: inputTokenSymbol,
          inputTokenAddress: inputTokenDetails?.address || "0x0",
          inputTokenAmount: inputAmount,
          outputTokenSymbol: outputTokenSymbol,
          outputTokenAddress: outputTokenDetails?.address || "0x0",
          outputTokenAmount: quote?.outputAmount || "0",
        }
        fetch(`/api/users/${finalUserId}/my-trades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(executedTradeData),
        })
          .then(async (res) => {
            if (res.ok) {
              toast({ title: "Copy Trade Recorded", description: "Your copy trade has been saved." })
            } else {
              const errorData = await res.json()
              toast({
                title: "Failed to Record Copy Trade",
                description: errorData.error || "Could not save trade.",
                variant: "destructive",
              })
            }
          })
          .catch((err) => {
            console.error("Error saving copy trade:", err)
            toast({ title: "Failed to Record Copy Trade", description: "Error saving trade.", variant: "destructive" })
          })
      }
      setTimeout(() => {
        onClose()
        setInputAmount("")
        setQuote(null)
      }, 3000)
    }
    if (sendTxError || confirmationSwapError) {
      const errorMsg = sendTxError?.message || confirmationSwapError?.message || "Transaction failed"
      toast({
        title: "Swap Failed",
        description: errorMsg.substring(0, 100) + "...",
        variant: "destructive",
      })
    }
  }, [
    isConfirmedSwap,
    swapHash,
    onClose,
    sendTxError,
    confirmationSwapError,
    originalTradeContext,
    currentUserId,
    authUserId,
    inputTokenSymbol,
    outputTokenSymbol,
    inputAmount,
    quote,
  ])

  const handleApprove = async () => {
    if (!inputToken || !address || inputToken.address === KNOWN_CONTRACTS.NATIVE_MON.address) return

    setApiError(null)
    try {
      await approveAsync({
        address: inputToken.address as `0x${string}`,
        abi: erc20ABI,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, ethers.MaxUint256], // Approve MaxUint256
      })
    } catch (error) {
      console.error("Error sending approval:", error)
      const errorMsg = error instanceof Error ? error.message : "Could not send approval."
      setApiError(errorMsg)
      toast({ title: "Approval Failed", description: errorMsg.substring(0, 100) + "...", variant: "destructive" })
    }
  }

  const handleSwapOrApprove = async () => {
    if (needsApproval) {
      await handleApprove()
    } else {
      // Proceed with swap
      if (!quote || !address || !isConnected || !inputTokenSymbol || !outputTokenSymbol) {
        toast({ title: "Swap Error", description: "Missing info or not connected.", variant: "destructive" })
        return
      }
      if (chain?.id !== monadTestnet.id) {
        toast({ title: "Wrong Network", description: "Switch to Monad Testnet.", variant: "destructive" })
        return
      }
      setApiError(null)
      try {
        const response = await fetch("/api/dex/prepare-swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputTokenSymbol,
            outputTokenSymbol,
            inputAmount,
            slippage: slippage.toString(),
            recipient: address,
          }),
        })
        const txPrepareData = await response.json()
        if (!response.ok) {
          throw new Error(txPrepareData.error || txPrepareData.details || "Failed to prepare swap")
        }
        sendTransaction({
          to: txPrepareData.to,
          data: txPrepareData.data,
          value: txPrepareData.value ? BigInt(txPrepareData.value) : undefined,
        })
      } catch (error) {
        console.error("Error preparing/sending swap:", error)
        const errorMsg = error instanceof Error ? error.message : "Could not execute swap."
        setApiError(errorMsg)
        toast({ title: "Swap Prep Failed", description: errorMsg, variant: "destructive" })
      }
    }
  }

  const handleFlipTokens = () => {
    const currentInput = inputTokenSymbol
    setInputTokenSymbol(outputTokenSymbol)
    setOutputTokenSymbol(currentInput)
    setInputAmount("")
    setQuote(null)
    setApiError(null)
    setCurrentAllowance(0n) // Reset allowance as token changed
    setNeedsApproval(false) // Will be re-evaluated
  }

  const isButtonDisabled =
    !isConnected ||
    isLoadingQuote ||
    isCheckingAllowance ||
    isApproving ||
    isConfirmingApproval ||
    isSendingTx ||
    isConfirmingSwap ||
    (chain?.id !== monadTestnet.id && !needsApproval) || // Disable if wrong network unless it's for approval
    (!quote && !needsApproval && Number.parseFloat(inputAmount || "0") > 0) || // No quote and not an approval action
    Number.parseFloat(inputAmount || "0") <= 0

  const buttonText = () => {
    if (!isConnected) return "Connect Wallet"
    if (chain?.id !== monadTestnet.id) return "Switch to Monad Testnet"
    if (isCheckingAllowance)
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking Allowance...
        </>
      )
    if (needsApproval)
      return isApproving || isConfirmingApproval ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Approving {inputTokenSymbol}...
        </>
      ) : (
        `Approve ${inputTokenSymbol}`
      )
    if (isLoadingQuote && Number.parseFloat(inputAmount || "0") > 0)
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Fetching Quote...
        </>
      )
    if (isSendingTx)
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Awaiting Signature...
        </>
      )
    if (isConfirmingSwap)
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Confirming Swap...
        </>
      )
    if (!quote && Number.parseFloat(inputAmount || "0") > 0) return "Enter Valid Amount"
    if (!inputAmount || Number.parseFloat(inputAmount) <= 0) return "Enter Amount"
    return `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
  }

  const buttonIcon = () => {
    if (needsApproval && !(isApproving || isConfirmingApproval)) return <LockKeyhole className="h-4 w-4 mr-2" />
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Swap Tokens</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription className="text-gray-300">Swap tokens on Monad with minimal slippage</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showSettings && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Swap Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Slippage Tolerance</label>
                  <div className="flex gap-2">
                    {[0.5, 1.0, 2.0].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(value)}
                        className={`text-xs ${slippage === value ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-600 border-gray-600"}`}
                      >
                        {value}%
                      </Button>
                    ))}
                    <Input
                      type="number"
                      value={slippage}
                      onChange={(e) =>
                        setSlippage(Math.max(0.1, Math.min(50, Number.parseFloat(e.target.value) || 1.0)))
                      }
                      className="w-20 text-xs bg-gray-700 border-gray-600"
                      step="0.1"
                      min="0.1"
                      max="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">From</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="flex-1 text-lg bg-transparent border-none p-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Select value={inputTokenSymbol} onValueChange={setInputTokenSymbol}>
                  <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {tokens.map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        className="text-white hover:!bg-gray-700 focus:!bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={token.logoURI || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`}
                            alt={token.symbol}
                            className="w-5 h-5 rounded-full"
                          />
                          {token.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlipTokens}
              className="rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">To (Estimated)</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={
                    isLoadingQuote && Number.parseFloat(inputAmount || "0") > 0
                      ? "Loading..."
                      : quote?.outputAmount || ""
                  }
                  readOnly
                  className="flex-1 text-lg bg-transparent border-none p-0 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Select value={outputTokenSymbol} onValueChange={setOutputTokenSymbol}>
                  <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {tokens.map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        className="text-white hover:!bg-gray-700 focus:!bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={token.logoURI || `https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol}`}
                            alt={token.symbol}
                            className="w-5 h-5 rounded-full"
                          />
                          {token.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {quote && !isLoadingQuote && Number.parseFloat(inputAmount || "0") > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Price</span>
                  <span className="text-white">
                    1 {inputTokenSymbol} ≈ {(Number(quote.outputAmount) / Number(inputAmount)).toFixed(6)}{" "}
                    {outputTokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price Impact</span>
                  <span className={(quote.priceImpact || 0) > 3 ? "text-red-400" : "text-green-400"}>
                    {(quote.priceImpact || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Est. Gas</span>
                  <span className="text-white">{quote.gasEstimate} MON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Slippage</span>
                  <span className="text-white">{slippage}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {apiError && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {quote && (quote.priceImpact || 0) > 5 && (
            <Alert className="bg-orange-500/10 border-orange-500/20">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                High price impact! Your trade may result in a significantly worse price.
              </AlertDescription>
            </Alert>
          )}

          {chain && chain.id !== monadTestnet.id && isConnected && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription>Please switch to Monad Testnet to perform swaps.</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSwapOrApprove}
            disabled={isButtonDisabled}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 disabled:opacity-50"
          >
            {buttonIcon()}
            {buttonText()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
