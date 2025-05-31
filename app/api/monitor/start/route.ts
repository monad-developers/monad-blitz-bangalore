import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { AppTransaction, BlockVisionTransactionResult, BlockVisionTransaction } from "@/lib/types" // Ensure BlockVisionTransaction is defined or imported

const DATABASE_URL = process.env.DATABASE_URL
const BLOCKVISION_API_KEY = process.env.BLOCKVISION_API_KEY
const MONAD_CHAIN_ID = "monad" // Or your specific chain ID for Monad on BlockVision

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}
if (!BLOCKVISION_API_KEY) {
  throw new Error("BLOCKVISION_API_KEY environment variable is not set")
}

const sql = neon(DATABASE_URL)

// Define the type for watched addresses with their associated user IDs
interface WatchedAddressInfo {
  wallet_address: string
  farcaster_user_id: string // The user ID of the person being watched
}

interface WatcherInfo {
  watcher_user_id: string // The user ID of the person doing the watching
  watched_farcaster_user_id: string // The Farcaster user ID of the person being watched
}

async function getWatchedAddressesAndWatchers(): Promise<{
  watchedAddresses: WatchedAddressInfo[]
  watchersMap: Map<string, string[]>
}> {
  // Fetch all distinct watched_user_ids (Farcaster IDs)
  const watchedFarcasterUsers = await sql`
    SELECT DISTINCT watched_user_id 
    FROM watchlists
  `

  const watchedAddresses: WatchedAddressInfo[] = []
  const watchersMap = new Map<string, string[]>() // Maps watched_farcaster_user_id to list of watcher_user_ids

  if (watchedFarcasterUsers.length > 0) {
    const watchedFarcasterUserIds = watchedFarcasterUsers.map((u) => u.watched_user_id)

    // Fetch wallet addresses for these Farcaster users
    const wallets = await sql`
      SELECT user_id, wallet_address 
      FROM user_wallets 
      WHERE user_id IN (${sql(watchedFarcasterUserIds)}) AND chain = 'monad'
    `

    wallets.forEach((wallet) => {
      watchedAddresses.push({
        wallet_address: wallet.wallet_address,
        farcaster_user_id: wallet.user_id, // This is the Farcaster ID of the wallet owner
      })
    })

    // Fetch all watchlist entries to build the watchersMap
    const allWatchlistEntries: WatcherInfo[] = await sql`
      SELECT watcher_user_id, watched_user_id AS watched_farcaster_user_id
      FROM watchlists
    `

    allWatchlistEntries.forEach((entry) => {
      const watchers = watchersMap.get(entry.watched_farcaster_user_id) || []
      watchers.push(entry.watcher_user_id)
      watchersMap.set(entry.watched_farcaster_user_id, watchers)
    })
  }
  return {
    watchedAddresses: Array.from(new Set(watchedAddresses.map((wa) => wa.wallet_address))) // Unique addresses
      .map((addr) => watchedAddresses.find((wa) => wa.wallet_address === addr)!),
    watchersMap,
  }
}

async function fetchTransactionsFromBlockVision(address: string): Promise<BlockVisionTransaction[]> {
  const thirtySecondsAgo = Math.floor((Date.now() - 35 * 1000) / 1000) // 35 seconds for a small buffer
  // BlockVision API expects starttime in seconds.
  // Fetching more than needed and filtering is safer due to potential clock skews or API delays.
  // Adjust 'limit' and 'starttime' as needed. 'limit' might be small if tx volume is low.
  // The BlockVision API for Monad might differ slightly, consult their docs.
  // Using a generic endpoint structure here.
  const url = `https://api.blockvision.org/v2/monad/account/transactions?address=${address}&page=1&size=20&starttime=${thirtySecondsAgo}`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": BLOCKVISION_API_KEY!,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`BlockVision API error for ${address}: ${response.status} ${await response.text()}`)
      return []
    }
    const data: BlockVisionTransactionResult = await response.json()
    return data.result?.docs || []
  } catch (error) {
    console.error(`Failed to fetch transactions for ${address} from BlockVision:`, error)
    return []
  }
}

function mapBlockVisionTxToAppTransaction(tx: BlockVisionTransaction, traderFid: string): AppTransaction {
  // Basic mapping, enhance as needed based on BlockVision's response structure for Monad
  // and what AppTransaction requires.
  const valueInEth = tx.value ? (BigInt(tx.value) / BigInt(10 ** 18)).toString() : "0" // Assuming 18 decimals for MON

  return {
    hash: tx.hash,
    blockNumber: tx.blockNumber ? Number.parseInt(tx.blockNumber, 10) : undefined,
    timestamp: tx.timestamp ? Math.floor(tx.timestamp / 1000) : Math.floor(Date.now() / 1000), // ms to s
    from: tx.from,
    to: tx.to || undefined, // 'to' can be null for contract creations
    value: valueInEth,
    gasUsed: tx.gasUsed ? Number.parseInt(tx.gasUsed) : undefined,
    gasPrice: tx.gasPrice ? (BigInt(tx.gasPrice) / BigInt(10 ** 9)).toString() : undefined, // gwei
    status: tx.status === 1 ? "success" : "failed",
    action: tx.methodName || "unknown",
    traderFid: traderFid,
    // These fields might require deeper inspection of logs or a different BlockVision endpoint
    inputTokenSymbol: tx.tokenTransfers?.[0]?.symbol || undefined,
    outputTokenSymbol: tx.tokenTransfers?.[1]?.symbol || undefined,
    inputTokenAmount: tx.tokenTransfers?.[0]?.amount
      ? (BigInt(tx.tokenTransfers[0].amount) / BigInt(10 ** (tx.tokenTransfers[0].decimals || 18))).toString()
      : undefined,
    outputTokenAmount: tx.tokenTransfers?.[1]?.amount
      ? (BigInt(tx.tokenTransfers[1].amount) / BigInt(10 ** (tx.tokenTransfers[1].decimals || 18))).toString()
      : undefined,
    tokenName: tx.tokenTransfers?.[0]?.name || undefined,
    tokenSymbol: tx.tokenTransfers?.[0]?.symbol || undefined,
    tokenAddress: tx.tokenTransfers?.[0]?.contractAddress || undefined,
    parsedMethodName: tx.methodName || undefined,
    interactedContractAddress: tx.to || undefined,
    interactedContractName: undefined, // Requires lookup or pre-mapping
  }
}

async function createNotificationForWatchers(
  transaction: AppTransaction,
  traderFid: string,
  watchersMap: Map<string, string[]>,
) {
  const watchers = watchersMap.get(traderFid) || [] // Get users watching this traderFid

  for (const watcherUserId of watchers) {
    try {
      // Check if notification already exists to prevent duplicates if cron runs too close
      const existingNotification = await sql`
        SELECT id FROM notifications 
        WHERE user_id = ${watcherUserId} AND transaction_hash = ${transaction.hash} AND trader_user_id = ${traderFid}
      `

      if (existingNotification.length === 0) {
        await sql`
          INSERT INTO notifications (user_id, type, message, transaction_hash, trader_user_id, data, created_at, is_read)
          VALUES (
            ${watcherUserId}, 
            'trade', 
            ${`Trader ${traderFid} executed a transaction: ${transaction.action || "Unknown Action"} on ${transaction.interactedContractName || transaction.interactedContractAddress || "Unknown Contract"}`},
            ${transaction.hash},
            ${traderFid},
            ${JSON.stringify(transaction)},
            NOW(),
            false
          )
        `
        console.log(`Notification created for user ${watcherUserId} for tx ${transaction.hash} by trader ${traderFid}`)
      } else {
        // console.log(`Notification already exists for user ${watcherUserId}, tx ${transaction.hash}, trader ${traderFid}`);
      }
    } catch (error) {
      console.error(`Error creating notification for user ${watcherUserId} for tx ${transaction.hash}:`, error)
    }
  }
}

// Handler for both GET (for Vercel Crons) and POST (for manual trigger if needed)
async function handler(request: NextRequest) {
  console.log(`[${new Date().toISOString()}] /api/monitor/start triggered (${request.method})`)

  const { watchedAddresses, watchersMap } = await getWatchedAddressesAndWatchers()
  if (watchedAddresses.length === 0) {
    console.log("No addresses are currently being watched.")
    return NextResponse.json({ message: "No addresses to monitor." })
  }

  const thirtySecondsAgoTimestamp = Math.floor((Date.now() - 30 * 1000) / 1000) // Unix timestamp in seconds

  let notificationsCreatedCount = 0

  for (const watched of watchedAddresses) {
    const transactions = await fetchTransactionsFromBlockVision(watched.wallet_address)

    for (const tx of transactions) {
      const txTimestamp = Math.floor(tx.timestamp / 1000) // ms to s
      if (txTimestamp >= thirtySecondsAgoTimestamp) {
        // This transaction is within the last 30 seconds
        const appTx = mapBlockVisionTxToAppTransaction(tx, watched.farcaster_user_id)
        await createNotificationForWatchers(appTx, watched.farcaster_user_id, watchersMap)
        notificationsCreatedCount++
      }
    }
  }

  console.log(
    `Polling complete. ${notificationsCreatedCount} potential new transaction activities processed for notifications.`,
  )
  return NextResponse.json({
    message: "Transaction polling cycle complete.",
    notificationsProcessed: notificationsCreatedCount,
  })
}

export { handler as GET, handler as POST }
