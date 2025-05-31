import { neon } from "@neondatabase/serverless"
import type { FarcasterUser, Notification, WatchlistUser } from "./types"

const sql = neon(process.env.DATABASE_URL!)

export class Database {
  public sql = sql // Expose the sql client

  // Wallet user operations
  async createWalletUser(walletAddress: string, signature?: string): Promise<string> {
    const userId = `wallet_${walletAddress.slice(2, 10)}`

    try {
      // First check if user exists
      const existingUser = await sql`
      SELECT id FROM users WHERE wallet_address = ${walletAddress.toLowerCase()} LIMIT 1
    `

      if (existingUser.length > 0) {
        // Update existing user
        await sql`
        UPDATE users SET 
          auth_signature = ${signature || null},
          last_login = NOW()
        WHERE wallet_address = ${walletAddress.toLowerCase()}
      `
        return existingUser[0].id
      } else {
        // Insert new user
        await sql`
        INSERT INTO users (id, username, display_name, bio, avatar_url, followers_count, following_count, verified, wallet_address, auth_signature, last_login)
        VALUES (${userId}, ${walletAddress.slice(0, 8)}, ${"Wallet User"}, ${"Connected via wallet"}, ${"/placeholder.svg"}, ${0}, ${0}, ${false}, ${walletAddress.toLowerCase()}, ${signature || null}, NOW())
      `
        return userId
      }
    } catch (error) {
      console.error("Error creating wallet user:", error)
      throw error
    }
  }

  async getUserByWallet(walletAddress: string): Promise<any | null> {
    const result = await sql`
    SELECT * FROM users WHERE wallet_address = ${walletAddress.toLowerCase()} LIMIT 1
  `

    if (result.length === 0) return null

    const user = result[0]
    return {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      wallet_address: user.wallet_address,
      created_at: user.created_at,
      last_login: user.last_login,
      verified: user.verified,
    }
  }

  // User operations
  async saveUser(user: FarcasterUser): Promise<void> {
    try {
      console.log("Saving user to database:", user.fid, user.username)
      console.log("User connected addresses:", user.connectedAddresses)

      // Check if user exists by farcaster_id
      const existingUser = await sql`
      SELECT id FROM users WHERE farcaster_id = ${user.fid} LIMIT 1
    `

      if (existingUser.length > 0) {
        console.log("Updating existing user:", user.fid)
        // Update existing user
        await sql`
        UPDATE users SET 
          username = ${user.username},
          display_name = ${user.displayName},
          bio = ${user.bio || ""},
          avatar_url = ${user.pfpUrl},
          followers_count = ${user.followerCount},
          following_count = ${user.followingCount},
          verified = ${user.verifications.length > 0},
          updated_at = NOW()
        WHERE farcaster_id = ${user.fid}
      `
      } else {
        console.log("Inserting new user:", user.fid)
        // Insert new user
        await sql`
        INSERT INTO users (id, username, display_name, bio, avatar_url, followers_count, following_count, verified, farcaster_id)
        VALUES (${user.fid.toString()}, ${user.username}, ${user.displayName}, ${user.bio || ""}, ${user.pfpUrl}, ${user.followerCount}, ${user.followingCount}, ${user.verifications.length > 0}, ${user.fid})
      `
      }

      // Clear existing wallets for this user first
      await sql`
      DELETE FROM wallets WHERE user_id = ${user.fid.toString()}
    `

      // Save connected addresses
      console.log("Saving wallet addresses for user:", user.fid)
      for (const address of user.connectedAddresses) {
        try {
          console.log("Saving wallet address:", address)
          await sql`
          INSERT INTO wallets (user_id, address, chain, is_primary)
          VALUES (${user.fid.toString()}, ${address.toLowerCase()}, 'ethereum', false)
        `
          console.log("Successfully saved wallet:", address)
        } catch (walletError) {
          console.error("Error saving wallet address:", address, walletError)
        }
      }

      console.log("User save completed for:", user.fid)
    } catch (error) {
      console.error("Error saving user:", error)
      throw error
    }
  }

  async getUserByUsername(username: string): Promise<FarcasterUser | null> {
    const result = await sql`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `

    if (result.length === 0) return null

    const user = result[0]
    const wallets = await sql`
    SELECT address FROM wallets WHERE user_id = ${user.id}
  `

    return {
      fid: user.farcaster_id,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      pfpUrl: user.avatar_url,
      followerCount: user.followers_count,
      followingCount: user.following_count,
      verifications: user.verified ? ["ethereum"] : [],
      connectedAddresses: wallets.map((w: any) => w.address),
    }
  }

  async getUserById(userId: string): Promise<WatchlistUser | null> {
    const result = await sql`
    SELECT * FROM users WHERE id = ${userId} LIMIT 1
  `

    if (result.length === 0) return null

    const user = result[0]
    const wallets = await sql`
    SELECT address FROM wallets WHERE user_id = ${user.id}
  `

    return {
      fid: user.farcaster_id || 0,
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      pfpUrl: user.avatar_url,
      followerCount: user.followers_count,
      followingCount: user.following_count,
      verifications: user.verified ? ["ethereum"] : [],
      connectedAddresses: wallets.map((w: any) => w.address),
      addedAt: user.created_at,
      isActive: true,
    }
  }

  // Watchlist operations
  async addToWatchlist(watcherUserId: string, watchedUserId: string): Promise<void> {
    try {
      console.log("Adding to watchlist database:", { watcherUserId, watchedUserId })

      // Check if already exists
      const existing = await sql`
      SELECT watcher_user_id FROM watchlists 
      WHERE watcher_user_id = ${watcherUserId} AND watched_user_id = ${watchedUserId} 
      LIMIT 1
    `

      if (existing.length === 0) {
        await sql`
        INSERT INTO watchlists (watcher_user_id, watched_user_id)
        VALUES (${watcherUserId}, ${watchedUserId})
      `
        console.log("Successfully added to watchlist")
      } else {
        console.log("User already in watchlist")
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
      throw error
    }
  }

  async removeFromWatchlist(watcherUserId: string, watchedUserId: string): Promise<void> {
    await sql`
    DELETE FROM watchlists 
    WHERE watcher_user_id = ${watcherUserId} AND watched_user_id = ${watchedUserId}
  `
  }

  async getWatchlist(userId: string): Promise<WatchlistUser[]> {
    console.log("Fetching watchlist for user:", userId)

    const result = await sql`
    SELECT u.*, w.created_at as added_at
    FROM users u
    JOIN watchlists w ON u.id = w.watched_user_id
    WHERE w.watcher_user_id = ${userId}
    ORDER BY w.created_at DESC
  `

    console.log("Watchlist query result:", result)

    // Get wallet addresses for each user
    const watchlistWithWallets = await Promise.all(
      result.map(async (row: any) => {
        console.log("Fetching wallets for user:", row.id)

        const wallets = await sql`
        SELECT address FROM wallets WHERE user_id = ${row.id}
      `

        console.log("Wallets found:", wallets)

        return {
          fid: row.farcaster_id || 0,
          username: row.username,
          displayName: row.display_name,
          bio: row.bio,
          pfpUrl: row.avatar_url,
          followerCount: row.followers_count,
          followingCount: row.following_count,
          verifications: row.verified ? ["ethereum"] : [],
          connectedAddresses: wallets.map((w: any) => w.address),
          addedAt: row.added_at,
          isActive: true,
        }
      }),
    )

    console.log("Final watchlist with wallets:", watchlistWithWallets)
    return watchlistWithWallets
  }

  async getWatchedAddresses(userId: string): Promise<string[]> {
    const result = await sql`
    SELECT DISTINCT w.address
    FROM wallets w
    JOIN watchlists wl ON w.user_id = wl.watched_user_id
    WHERE wl.watcher_user_id = ${userId}
  `

    return result.map((row: any) => row.address)
  }

  // Notification operations
  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<void> {
    await sql`
    INSERT INTO notifications (
      user_id, trader_user_id, transaction_hash, action, 
      token_symbol, token_name, token_address, amount, 
      value_usd, wallet_address, block_number
    )
    VALUES (
      ${notification.userId}, ${notification.traderId}, ${notification.transaction.hash},
      ${notification.transaction.action}, ${notification.transaction.tokenSymbol || ""},
      ${notification.transaction.tokenName || ""}, ${notification.transaction.tokenAddress || ""},
      ${notification.transaction.value}, 0, ${notification.transaction.from},
      ${notification.transaction.blockNumber}
    )
  `
  }

  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const result = await sql`
    SELECT n.*, u.username, u.display_name, u.avatar_url
    FROM notifications n
    JOIN users u ON n.trader_user_id = u.id
    WHERE n.user_id = ${userId}
    ORDER BY n.created_at DESC
    LIMIT ${limit}
  `

    return result.map((row: any) => ({
      id: row.id.toString(),
      userId: row.user_id,
      traderId: row.trader_user_id,
      traderUsername: row.username,
      traderDisplayName: row.display_name,
      traderPfp: row.avatar_url,
      transaction: {
        hash: row.transaction_hash,
        from: row.wallet_address,
        to: "",
        value: row.amount,
        tokenSymbol: row.token_symbol,
        tokenName: row.token_name,
        tokenAddress: row.token_address,
        blockNumber: row.block_number,
        timestamp: new Date(row.created_at).getTime() / 1000,
        action: row.action as any,
      },
      createdAt: row.created_at,
      read: row.is_read,
    }))
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await sql`
    UPDATE notifications 
    SET is_read = true 
    WHERE id = ${Number.parseInt(notificationId)}
  `
  }

  async updateUserLogin(walletAddress: string): Promise<void> {
    await sql`
    UPDATE users 
    SET last_login = NOW() 
    WHERE wallet_address = ${walletAddress.toLowerCase()}
  `
  }

  async getUserStats(userId: string): Promise<{
    watching: number
    notifications: number
    unread: number
    watchingThisWeek: number
    notificationsToday: number
    lastNotificationTime: string | null
  }> {
    const watchingResult = await sql`
    SELECT COUNT(*) as count FROM watchlists WHERE watcher_user_id = ${userId}
  `

    const watchingThisWeekResult = await sql`
    SELECT COUNT(*) as count FROM watchlists 
    WHERE watcher_user_id = ${userId} 
    AND created_at >= NOW() - INTERVAL '7 days'
  `

    const notificationsResult = await sql`
    SELECT 
      COUNT(*) as total, 
      COUNT(*) FILTER (WHERE is_read = false) as unread,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today
    FROM notifications WHERE user_id = ${userId}
  `

    const lastNotificationResult = await sql`
    SELECT created_at FROM notifications 
    WHERE user_id = ${userId} AND is_read = false
    ORDER BY created_at DESC 
    LIMIT 1
  `

    const lastNotificationTime =
      lastNotificationResult.length > 0 ? this.formatTimeAgo(new Date(lastNotificationResult[0].created_at)) : null

    return {
      watching: Number(watchingResult[0]?.count || 0),
      notifications: Number(notificationsResult[0]?.total || 0),
      unread: Number(notificationsResult[0]?.unread || 0),
      watchingThisWeek: Number(watchingThisWeekResult[0]?.count || 0),
      notificationsToday: Number(notificationsResult[0]?.today || 0),
      lastNotificationTime,
    }
  }

  // User Token Balance data (replaces getUserPnlData)
  async getUserTokenBalanceData(
    userId: string,
    tokenSymbol: string, // Added tokenSymbol
    timeframe = "7d",
    walletAddress?: string,
  ): Promise<any[]> {
    const seed = userId.charCodeAt(0) + (walletAddress ? walletAddress.charCodeAt(2) : 0) + tokenSymbol.charCodeAt(0)

    let days = 7
    switch (timeframe) {
      case "24h":
        days = 1
        break
      case "7d":
        days = 7
        break
      case "30d":
        days = 30
        break
      case "all":
        days = 90
        break // Max 90 days for mock data
    }

    const mockTokenBalanceData = []
    const now = new Date()
    // Simulate a starting balance for the token, varying by token and seed
    const startBalance = tokenSymbol === "MON" ? 50 + (seed % 50) : 1000 + (seed % 9000)
    let currentBalance = startBalance

    for (let i = 0; i <= days; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (days - i))

      // Consistent random daily change in token quantity
      const randomFactor = (((seed + i) % 200) - 100) / (tokenSymbol === "MON" ? 2000 : 1000) // Smaller changes for MON
      const dailyChange = currentBalance * randomFactor
      currentBalance += dailyChange

      mockTokenBalanceData.push({
        date: date.toISOString().split("T")[0],
        balance: Math.max(0, currentBalance), // Token quantity
        change: dailyChange, // Change in token quantity
        tokenSymbol: tokenSymbol,
      })
    }
    return mockTokenBalanceData
  }

  // Make sure to remove or comment out the old getUserPnlData function
  /*
async getUserPnlData(userId: string, timeframe = "7d", walletAddress?: string): Promise<any[]> {
  // ... old implementation ...
}
*/

  /*
// User PNL data
async getUserPnlData(userId: string, timeframe = "7d", walletAddress?: string): Promise<any[]> {
  // In a real implementation, this would calculate PNL from transaction history
  // For now, we'll return mock data, slightly varied by walletAddress for consistency
  const seed = userId.charCodeAt(0) + (walletAddress ? walletAddress.charCodeAt(2) : 0) // Simple seed

  let days = 7
  switch (timeframe) {
    case "24h":
      days = 1
      break
    case "7d":
      days = 7
      break
    case "30d":
      days = 30
      break
    case "all":
      days = 90
      break
  }

  const mockPnlData = []
  const now = new Date()
  // Vary start balance slightly based on seed to simulate different wallets
  const startBalance = 10000 + (seed % 5000)
  let currentBalance = startBalance

  // Generate data points
  for (let i = 0; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - i))

    // Consistent random daily change
    const randomFactor = (((seed + i) % 200) - 100) / 1000 // Change between -10% and +10%
    const dailyChange = currentBalance * randomFactor
    currentBalance += dailyChange

    mockPnlData.push({
      date: date.toISOString().split("T")[0],
      balance: Math.max(0, currentBalance), // Ensure balance doesn't go negative
      change: dailyChange,
      percentChange: randomFactor * 100,
    })
  }

  return mockPnlData
}
*/

  private formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  // Add new methods for executed_copy_trades

  // At the end of the Database class, before the export:

  async saveExecutedCopyTrade(tradeData: {
    userId: string
    copiedFromTraderId: string
    copiedFromTraderDisplayName: string
    copiedFromTraderPfpUrl?: string
    originalTransactionHash: string
    copyTransactionHash: string
    inputTokenSymbol: string
    inputTokenAddress: string
    inputTokenAmount: string
    outputTokenSymbol: string
    outputTokenAddress: string
    outputTokenAmount: string
  }): Promise<number> {
    try {
      const result = await sql`
      INSERT INTO executed_copy_trades (
        user_id,
        copied_from_trader_id,
        copied_from_trader_display_name,
        copied_from_trader_pfp_url,
        original_transaction_hash,
        copy_transaction_hash,
        input_token_symbol,
        input_token_address,
        input_token_amount,
        output_token_symbol,
        output_token_address,
        output_token_amount
      ) VALUES (
        ${tradeData.userId},
        ${tradeData.copiedFromTraderId},
        ${tradeData.copiedFromTraderDisplayName},
        ${tradeData.copiedFromTraderPfpUrl || null},
        ${tradeData.originalTransactionHash},
        ${tradeData.copyTransactionHash},
        ${tradeData.inputTokenSymbol},
        ${tradeData.inputTokenAddress},
        ${tradeData.inputTokenAmount},
        ${tradeData.outputTokenSymbol},
        ${tradeData.outputTokenAddress},
        ${tradeData.outputTokenAmount}
      )
      RETURNING id
    `
      return result[0].id
    } catch (error) {
      console.error("Error saving executed copy trade:", error)
      // Check for unique constraint violation on copy_transaction_hash
      if (
        error instanceof Error &&
        "constraint_name" in error &&
        (error as any).constraint_name === "executed_copy_trades_copy_transaction_hash_key"
      ) {
        console.warn(`Attempted to insert duplicate copy_transaction_hash: ${tradeData.copyTransactionHash}`)
        // Optionally, you could fetch the existing record's ID or handle as an update
        const existing =
          await sql`SELECT id FROM executed_copy_trades WHERE copy_transaction_hash = ${tradeData.copyTransactionHash}`
        if (existing.length > 0) return existing[0].id
      }
      throw error
    }
  }

  async getExecutedCopyTrades(userId: string): Promise<any[]> {
    try {
      const result = await sql`
      SELECT
        id::text, -- Cast serial to text for consistency if needed, or handle as number
        copied_from_trader_id,
        copied_from_trader_display_name,
        copied_from_trader_pfp_url,
        original_transaction_hash,
        copy_transaction_hash,
        input_token_symbol,
        input_token_address,
        input_token_amount,
        output_token_symbol,
        output_token_address,
        output_token_amount,
        executed_at as timestamp
      FROM executed_copy_trades
      WHERE user_id = ${userId}
      ORDER BY executed_at DESC
      LIMIT 50 -- Add pagination in a real app
    `
      return result.map((row: any) => ({
        ...row,
        timestamp: new Date(row.timestamp).toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching executed copy trades:", error)
      throw error
    }
  }
}

export const database = new Database()
