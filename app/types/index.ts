export interface FarcasterUser {
  id: string
  username: string
  displayName: string
  bio?: string
  avatar: string
  followers: number
  following: number
  verified: boolean
  wallets: string[]
  lastActive: string
}

export interface Token {
  symbol: string
  name: string
  price: number
  address: string
}

export interface Notification {
  id: string
  user: FarcasterUser
  action: "buy" | "sell" | "mint"
  token: Token
  amount: number
  value: number
  wallet: string
  timestamp: string
  read: boolean
}
