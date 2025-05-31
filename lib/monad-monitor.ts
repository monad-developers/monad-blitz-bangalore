// Monad blockchain monitoring using RPC Polling
import { ethers } from "ethers"
import type { Transaction as AppTransaction } from "./types"
import { KNOWN_CONTRACTS, tokenRegistry } from "./dex-integration"

const UNISWAP_V2_FUNCTION_SELECTORS = {
  SWAP_EXACT_TOKENS_FOR_TOKENS: "0x38ed1739",
  SWAP_TOKENS_FOR_EXACT_TOKENS: "0x8803dbee",
  SWAP_EXACT_ETH_FOR_TOKENS: "0x7ff36ab5",
  SWAP_TOKENS_FOR_EXACT_ETH: "0x4a25d94a",
  SWAP_EXACT_TOKENS_FOR_ETH: "0x18cbafe5",
  SWAP_ETH_FOR_EXACT_TOKENS: "0xfb3bdb41",
}

const SIMPLIFIED_SWAP_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)",
  "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)",
  "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)",
]
const iface = new ethers.Interface(SIMPLIFIED_SWAP_ABI)

interface TokenData {
  address: string
  symbol: string
  name: string
  decimals: number
}

export class MonadMonitor {
  private rpcUrl: string
  private watchedAddresses: Set<string> = new Set()
  private provider: ethers.JsonRpcProvider
  private onTransactionCallback: ((tx: AppTransaction) => void) | null = null
  private lastProcessedBlockNumber: number | null = null
  private pollingIntervalId: NodeJS.Timeout | null = null
  private isPolling = false
  private readonly POLLING_INTERVAL_MS = 15000 // Poll every 15 seconds

  constructor() {
    this.rpcUrl = "https://testnet-rpc.monad.xyz"
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl)
  }

  async startMonitoring(addresses: string[], onTransaction: (tx: AppTransaction) => void) {
    console.warn(
      "MonadMonitor (RPC Polling) is currently disabled in favor of BlockVision API polling for alerts. This call will have no effect.",
    )
    // Stop any existing polling if it were running
    this.stopMonitoring()
  }

  private async pollForNewTransactions() {
    if (this.isPolling) {
      // console.log("MonadMonitor (Polling): Poll already in progress, skipping.")
      return
    }
    this.isPolling = true
    // console.log("MonadMonitor (Polling): Polling for new transactions...")

    try {
      const currentBlockNumber = await this.provider.getBlockNumber()
      // console.log(`MonadMonitor (Polling): Current block: ${currentBlockNumber}, Last processed: ${this.lastProcessedBlockNumber}`)

      if (this.lastProcessedBlockNumber === null) {
        // Should have been initialized in startMonitoring, but as a fallback:
        this.lastProcessedBlockNumber = currentBlockNumber
        console.log(`MonadMonitor (Polling): lastProcessedBlockNumber was null, set to current: ${currentBlockNumber}`)
        this.isPolling = false
        return
      }

      if (currentBlockNumber > this.lastProcessedBlockNumber) {
        const startBlock = this.lastProcessedBlockNumber + 1
        const endBlock = currentBlockNumber
        // console.log(`MonadMonitor (Polling): Processing blocks from ${startBlock} to ${endBlock}`)

        for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
          // console.log(`MonadMonitor (Polling): Processing block ${blockNum}`)
          await this.processBlockByNumber(blockNum)
        }
        this.lastProcessedBlockNumber = endBlock
      } else {
        // console.log("MonadMonitor (Polling): No new blocks to process.")
      }
    } catch (error) {
      console.error("MonadMonitor (Polling): Error during polling:", error)
    } finally {
      this.isPolling = false
    }
  }

  private async processBlockByNumber(blockNumber: number) {
    try {
      const block = await this.provider.getBlock(blockNumber, true) // true for prefetching transactions
      if (!block || !block.prefetchedTransactions) {
        console.warn("MonadMonitor (Polling): Block or transactions not found for block number:", blockNumber)
        return
      }

      for (const txResponse of block.prefetchedTransactions) {
        if (this.isWatchedTransaction(txResponse)) {
          // console.log("MonadMonitor (Polling): Found watched transaction:", txResponse.hash, "in block", blockNumber)
          const receipt = await this.provider.getTransactionReceipt(txResponse.hash)
          if (receipt && this.onTransactionCallback) {
            const appTransaction = await this.parseTransaction(txResponse, receipt, block)
            if (appTransaction) {
              this.onTransactionCallback(appTransaction)
            }
          } else if (!receipt) {
            console.warn("MonadMonitor (Polling): Receipt not found for tx:", txResponse.hash)
          }
        }
      }
    } catch (error) {
      console.error("MonadMonitor (Polling): Error processing block number:", blockNumber, error)
    }
  }

  private isWatchedTransaction(tx: ethers.TransactionResponse): boolean {
    const from = tx.from.toLowerCase()
    const to = tx.to?.toLowerCase()
    return this.watchedAddresses.has(from) || (!!to && this.watchedAddresses.has(to))
  }

  private async parseTransaction(
    tx: ethers.TransactionResponse,
    receipt: ethers.TransactionReceipt,
    block: ethers.Block,
  ): Promise<AppTransaction | null> {
    try {
      const analysis = await this.analyzeTransactionLogic(tx, receipt)
      let valueFormatted = "0"
      if (tx.value) {
        try {
          valueFormatted = ethers.formatUnits(tx.value, 18)
        } catch (e) {
          console.warn(`Could not format native value ${tx.value.toString()} for tx ${tx.hash}:`, e)
          valueFormatted = tx.value.toString()
        }
      }

      return {
        id: tx.hash,
        hash: tx.hash,
        from: tx.from,
        to: tx.to || ethers.ZeroAddress,
        value: valueFormatted,
        tokenSymbol: analysis.tokenSymbol,
        tokenName: analysis.tokenName,
        tokenAddress: analysis.tokenAddress,
        blockNumber: block.number,
        timestamp: block.timestamp, // Unix timestamp in seconds
        action: analysis.action,
        parsedMethodName: analysis.parsedMethodName,
        inputTokenAddress: analysis.inputTokenAddress,
        inputTokenSymbol: analysis.inputTokenSymbol,
        inputTokenAmount: analysis.inputTokenAmount,
        outputTokenAddress: analysis.outputTokenAddress,
        outputTokenSymbol: analysis.outputTokenSymbol,
        outputTokenAmount: analysis.outputTokenAmount,
        dexRouterAddress: analysis.dexRouterAddress,
      }
    } catch (error) {
      console.error("MonadMonitor (Polling): Error parsing transaction:", tx.hash, error)
      return null
    }
  }

  private async analyzeTransactionLogic(
    tx: ethers.TransactionResponse,
    receipt: ethers.TransactionReceipt,
  ): Promise<Partial<AppTransaction>> {
    let action: AppTransaction["action"] = "transfer"
    let parsedMethodName: string | undefined = undefined
    let tokenSymbol: string | undefined
    let tokenName: string | undefined
    let tokenAddress: string | undefined
    let inputTokenAddress: string | undefined
    let inputTokenSymbol: string | undefined
    let outputTokenAddress: string | undefined
    let outputTokenSymbol: string | undefined
    let dexRouterAddress: string | undefined

    const txTo = tx.to?.toLowerCase()
    const txInput = tx.data

    if (
      txTo === KNOWN_CONTRACTS.UNISWAP_V2_ROUTER.address.toLowerCase() ||
      txTo === KNOWN_CONTRACTS.UNIVERSAL_ROUTER.address.toLowerCase()
    ) {
      dexRouterAddress = txTo
      action = "swap"
      const selector = txInput.slice(0, 10)

      try {
        const decodedInput = iface.parseTransaction({ data: txInput, value: tx.value })
        parsedMethodName = decodedInput?.name
        action = (decodedInput?.name.toLowerCase().includes("swap") ? "swap" : "interact") as AppTransaction["action"]

        if (decodedInput?.name.toLowerCase().includes("eth")) {
          inputTokenAddress = KNOWN_CONTRACTS.WMON.address
          if (decodedInput.args.path && decodedInput.args.path.length > 0) {
            outputTokenAddress = decodedInput.args.path[decodedInput.args.path.length - 1]
          }
        } else if (
          decodedInput?.args.path &&
          Array.isArray(decodedInput.args.path) &&
          decodedInput.args.path.length >= 2
        ) {
          const path = decodedInput.args.path as string[]
          inputTokenAddress = path[0]
          outputTokenAddress = path[path.length - 1]
        }
      } catch (e) {
        for (const [name, sel] of Object.entries(UNISWAP_V2_FUNCTION_SELECTORS)) {
          if (selector === sel) {
            parsedMethodName = name
            action = "swap"
            break
          }
        }
      }

      if (inputTokenAddress) {
        const tokenData = tokenRegistry.getTokenByAddress(inputTokenAddress)
        inputTokenSymbol = tokenData?.symbol
      }
      if (outputTokenAddress) {
        const tokenData = tokenRegistry.getTokenByAddress(outputTokenAddress)
        outputTokenSymbol = tokenData?.symbol
      }
      tokenSymbol = outputTokenSymbol
      tokenName = tokenRegistry.getTokenByAddress(outputTokenAddress || "")?.name
      tokenAddress = outputTokenAddress
    } else {
      const erc20TransferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
      for (const log of receipt.logs) {
        if (log.topics[0] === erc20TransferEventSignature && log.topics.length === 3) {
          const tknAddr = log.address.toLowerCase()
          const tokenData = tokenRegistry.getTokenByAddress(tknAddr) || (await this.fetchTokenInfo(tknAddr))
          if (tokenData) {
            tokenRegistry.addToken(tokenData)
            tokenSymbol = tokenData.symbol
            tokenName = tokenData.name
            tokenAddress = tknAddr
            action = "transfer"
            break
          }
        }
      }
      if (!tokenSymbol && tx.value > BigInt(0)) {
        tokenSymbol = "MON"
        tokenName = "Monad"
        tokenAddress = ethers.ZeroAddress
        action = "transfer"
      }
    }
    if (tx.to === null || tx.to === ethers.ZeroAddress) {
      action = "mint"
      parsedMethodName = "ContractCreation"
      if (receipt.contractAddress) {
        tokenAddress = receipt.contractAddress
        const createdTokenInfo = await this.fetchTokenInfo(receipt.contractAddress)
        if (createdTokenInfo.symbol !== "UNKNOWN") {
          tokenSymbol = createdTokenInfo.symbol
          tokenName = createdTokenInfo.name
          tokenRegistry.addToken(createdTokenInfo)
        }
      }
    }

    return {
      action,
      parsedMethodName,
      tokenSymbol,
      tokenName,
      tokenAddress,
      inputTokenAddress,
      inputTokenSymbol,
      outputTokenAddress,
      outputTokenSymbol,
      dexRouterAddress,
    }
  }

  private async fetchTokenInfo(tokenAddress: string): Promise<TokenData> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [
          "function symbol() view returns (string)",
          "function name() view returns (string)",
          "function decimals() view returns (uint8)",
        ],
        this.provider,
      )
      const [symbol, name, decimals] = await Promise.all([
        contract.symbol().catch(() => "UNKNOWN"),
        contract.name().catch(() => "Unknown Token"),
        contract.decimals().catch(() => 18),
      ])
      return { address: tokenAddress, symbol, name, decimals: Number(decimals) }
    } catch (error) {
      return { address: tokenAddress, symbol: "UNKNOWN", name: "Unknown Token", decimals: 18 }
    }
  }

  stopMonitoring() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId)
      this.pollingIntervalId = null
      this.isPolling = false
      console.log("MonadMonitor (Polling): Monitoring stopped (or was already stopped).")
    }
  }
}

export const monadMonitor = new MonadMonitor()
