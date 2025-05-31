export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  bio?: string
  pfpUrl: string
  followerCount: number
  followingCount: number
  verifications: string[]
  connectedAddresses: string[]
}

export interface Transaction {
  id: string // Added for easier keying in UI if needed, can be same as hash
  hash: string
  from: string
  to: string
  value: string // This is typically native token value for the tx itself
  tokenSymbol?: string // Primary token involved if not a swap (e.g. for simple transfers)
  tokenName?: string
  tokenAddress?: string
  blockNumber: number
  timestamp: number // Unix timestamp in seconds
  action: "buy" | "sell" | "transfer" | "mint" | "swap" | "interact" // Added "interact"
  // Fields for more detailed swap information
  parsedMethodName?: string
  inputTokenAddress?: string
  inputTokenSymbol?: string
  inputTokenAmount?: string
  outputTokenAddress?: string
  outputTokenSymbol?: string
  outputTokenAmount?: string
  dexRouterAddress?: string
}

export interface Notification {
  id: string
  userId: string // The user receiving the notification
  traderId: string // The user who made the trade being notified about
  traderUsername: string
  traderDisplayName: string
  traderPfp: string
  transaction: Transaction // Contains all the rich transaction details
  createdAt: string // Timestamp of when the notification was created
  read: boolean
}

export interface WatchlistUser extends FarcasterUser {
  addedAt: string
  isActive: boolean
}

export interface ExecutedCopyTrade {
  id: string // Unique ID for this record, can be the copy trade's transaction hash
  copiedFromTraderId: string
  copiedFromTraderDisplayName: string
  copiedFromTraderPfpUrl: string
  originalTxHash: string // Hash of the trade that was copied
  copyTxHash: string // Hash of the user's executed copy trade
  inputTokenSymbol: string
  inputTokenAddress: string
  inputTokenAmount: string
  outputTokenSymbol: string
  outputTokenAddress: string
  outputTokenAmount: string // Actual output amount from the copy trade
  timestamp: string // Timestamp of when the copy trade was executed
}
