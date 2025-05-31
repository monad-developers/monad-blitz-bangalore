import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/database"
import type { Transaction as AppTransaction } from "@/lib/types" // Renamed to avoid conflict
import { ethers } from "ethers"

// Define a type for the transaction item from BlockVision API
interface BlockVisionTransaction {
  hash: string
  blockHash: string
  blockNumber: number
  timestamp: number // milliseconds
  from: string
  to: string
  value: string // e.g., in wei for ETH-like
  transactionFee: number
  gasUsed: number
  nonce: number
  transactionIndex: number
  contractAddress: string | null
  status: number
  methodID: string
  methodName: string
  // fromAddress and toAddress objects are also available but we'll use top-level from/to
}

interface BlockVisionApiResponse {
  code: number
  reason?: string
  message: string
  result?: {
    data: BlockVisionTransaction[]
    nextPageCursor?: string
    total?: number
  }
}

const MON_DECIMALS = 18

function mapToAction(methodName?: string): AppTransaction["action"] {
  if (!methodName) return "transfer" // Default if no method name

  const lowerMethodName = methodName.toLowerCase()
  if (lowerMethodName.includes("swap")) return "transfer" // Generic for now, "buy"/"sell" need more context
  if (lowerMethodName.includes("mint")) return "mint"
  if (lowerMethodName.includes("transfer")) return "transfer"
  if (lowerMethodName.includes("approve")) return "transfer" // Or a new "approve" action type
  // Add more mappings as needed
  return "transfer" // Fallback
}

async function fetchTransactionsForAddress(address: string, apiKey: string): Promise<AppTransaction[]> {
  const apiUrl = `https://api.blockvision.org/v2/monad/account/transactions?address=${address}&limit=50&ascendingOrder=false`
  try {
    const response = await fetch(apiUrl, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    if (!response.ok) {
      console.error(`BlockVision API error for ${address}: ${response.status} ${response.statusText}`)
      const errorBody = await response.text()
      console.error("Error body:", errorBody)
      return []
    }

    const data: BlockVisionApiResponse = await response.json()

    if (data.code !== 0 || !data.result || !data.result.data) {
      console.error(`BlockVision API returned error for ${address}: ${data.message} (Code: ${data.code})`)
      return []
    }

    return data.result.data.map((tx: BlockVisionTransaction): AppTransaction => {
      let formattedValue = "0"
      try {
        formattedValue = ethers.formatUnits(tx.value, MON_DECIMALS)
      } catch (e) {
        console.warn(`Could not format value ${tx.value} for tx ${tx.hash}:`, e)
        // Keep tx.value as is if formatting fails, or handle as appropriate
        formattedValue = tx.value // Or set to "0" or some error indicator
      }

      // Basic token symbol inference
      let tokenSymbol: string | undefined = undefined
      if (Number.parseFloat(formattedValue) > 0) {
        // If there's a native value transfer, assume it's MON
        tokenSymbol = "MON"
      }
      // More sophisticated token identification would require checking tx.to against known contract addresses
      // or parsing event logs, which is beyond this endpoint's direct capability.

      return {
        id: tx.hash, // Use hash as ID
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: formattedValue,
        tokenSymbol: tokenSymbol,
        tokenName: tokenSymbol === "MON" ? "Monad" : undefined,
        tokenAddress: undefined, // Not directly available from this endpoint for ERC20s
        blockNumber: tx.blockNumber,
        timestamp: Math.floor(tx.timestamp / 1000), // ms to s
        action: mapToAction(tx.methodName),
      }
    })
  } catch (error) {
    console.error(`Failed to fetch or process transactions for address ${address}:`, error)
    return []
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiKey = process.env.BLOCKVISION_API_KEY
    if (!apiKey) {
      console.error("BLOCKVISION_API_KEY environment variable is not set.")
      return NextResponse.json(
        { error: "Server configuration error: Missing API key for BlockVision." },
        { status: 500 },
      )
    }

    const userId = params.id
    const { searchParams } = new URL(request.url)
    // const days = Number.parseInt(searchParams.get("days") || "7") // "days" filter not directly supported by BV API endpoint, fetches recent
    const walletAddressFilter = searchParams.get("walletAddress") || undefined
    const tokenSymbolFilter = searchParams.get("tokenSymbol") || undefined

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let targetAddresses: string[] = []

    if (walletAddressFilter && walletAddressFilter !== "all") {
      targetAddresses.push(walletAddressFilter)
    } else {
      // Fetch all connected wallets for the user
      const user = await database.getUserById(userId)
      if (user && user.connectedAddresses && user.connectedAddresses.length > 0) {
        targetAddresses = user.connectedAddresses
      } else if (user && user.wallet_address) {
        // Fallback for users identified by a single wallet_address
        targetAddresses.push(user.wallet_address)
      }
    }

    if (targetAddresses.length === 0) {
      return NextResponse.json({ transactions: [] }) // No wallets to fetch for
    }

    const allTransactions: AppTransaction[] = []
    for (const addr of targetAddresses) {
      const userTransactions = await fetchTransactionsForAddress(addr, apiKey)
      allTransactions.push(...userTransactions)
    }

    // De-duplicate transactions by hash (in case a transaction involves multiple watched addresses of the same user)
    const uniqueTransactionsMap = new Map<string, AppTransaction>()
    allTransactions.forEach((tx) => uniqueTransactionsMap.set(tx.hash, tx))
    let uniqueTransactions = Array.from(uniqueTransactionsMap.values())

    // Sort by timestamp descending (newest first)
    uniqueTransactions.sort((a, b) => b.timestamp - a.timestamp)

    // Apply token symbol filter if provided (after fetching all transactions)
    if (tokenSymbolFilter && tokenSymbolFilter !== "All") {
      uniqueTransactions = uniqueTransactions.filter((tx) => tx.tokenSymbol === tokenSymbolFilter)
    }

    // The "days" filter would require fetching more data and filtering here,
    // for now, we return the most recent (up to limit per address).
    // Example: Filter for last 7 days
    // const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    // uniqueTransactions = uniqueTransactions.filter(tx => tx.timestamp >= sevenDaysAgo);

    return NextResponse.json({ transactions: uniqueTransactions.slice(0, 50) }) // Limit total results for now
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
