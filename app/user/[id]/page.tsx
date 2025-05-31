"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Clock,
  WalletIcon,
  Copy,
  PieChartIcon,
  ListIcon,
} from "lucide-react" // Added icons
import Link from "next/link"
import TransactionsTab from "@/app/components/user-profile/transactions-tab"
import PortfolioChartTab from "@/app/components/user-profile/portfolio-chart-tab" // Changed import
import type { WatchlistUser } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState<WatchlistUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions") // Default to transactions
  const [selectedWallet, setSelectedWallet] = useState<string>("all")

  useEffect(() => {
    fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`)
      }

      const data = await response.json()
      setUser(data.user)
      // Default to "all" wallets, or the first one if only one exists
      if (data.user?.connectedAddresses?.length === 1) {
        setSelectedWallet(data.user.connectedAddresses[0])
      } else {
        setSelectedWallet("all")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenFarcasterProfile = () => {
    if (user?.username) {
      window.open(`https://warpcast.com/${user.username}`, "_blank", "noopener,noreferrer")
    }
  }

  const walletToDisplay = useMemo(() => {
    return selectedWallet === "all" ? undefined : selectedWallet
  }, [selectedWallet])

  const copyToClipboard = (text: string, label = "Address") => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${label} Copied!`,
      description: text,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading user profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center text-white mb-6 hover:text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <Card className="bg-gray-900 border-gray-800 shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-white text-lg">User not found</p>
              <p className="text-gray-400 mt-2">The user you're looking for doesn't exist or has been removed.</p>
              <Button asChild className="mt-6 bg-white text-black hover:bg-gray-200">
                <Link href="/">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center text-white mb-6 hover:text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card className="bg-gray-900 border-gray-800 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 ring-2 ring-purple-400/50">
                <AvatarImage src={user.pfpUrl || "/placeholder.svg"} alt={user.displayName} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl">
                  {user.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                  {user.verifications.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
                  )}
                </div>
                <p className="text-gray-300 mb-3">@{user.username}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{user.followerCount.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <WalletIcon className="h-4 w-4" />
                    <span>
                      {user.connectedAddresses.length} wallet{user.connectedAddresses.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Added {new Date(user.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {user.connectedAddresses && user.connectedAddresses.length > 0 && (
                  <div className="max-w-xs">
                    <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <div className="flex items-center justify-between w-full">
                          <SelectValue placeholder="Select Wallet" />
                          {selectedWallet && selectedWallet !== "all" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(selectedWallet, "Selected Wallet Address")
                              }}
                              className="ml-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                              aria-label={`Copy selected wallet address ${selectedWallet}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {user.connectedAddresses.length > 1 && (
                          <SelectItem value="all" className="text-white hover:bg-gray-700">
                            All Connected Wallets
                          </SelectItem>
                        )}
                        {user.connectedAddresses.map((addr) => (
                          <div
                            key={addr}
                            className="flex items-center justify-between pr-2 hover:bg-gray-700 rounded-md"
                          >
                            <SelectItem
                              value={addr}
                              className="text-white font-mono text-xs flex-grow data-[state=checked]:bg-purple-600 data-[highlighted]:bg-gray-700"
                              style={{ paddingRight: "8px" }}
                            >
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </SelectItem>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(addr, "Wallet Address")
                              }}
                              className="p-1 h-auto text-gray-400 hover:text-white"
                              aria-label={`Copy wallet address ${addr}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleOpenFarcasterProfile}
                className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Farcaster Profile
              </Button>
            </div>

            {user.bio && <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-gray-300 text-sm">{user.bio}</div>}

            <div className="mt-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mr-2">FID: {user.fid}</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live Monitoring
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800 shadow-xl mb-6">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
            >
              <ListIcon className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="portfolio" // Changed value
              className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Portfolio {/* Changed name */}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionsTab userId={id as string} selectedWallet={walletToDisplay} />
          </TabsContent>

          <TabsContent value="portfolio">
            {" "}
            {/* Changed value */}
            <PortfolioChartTab userId={id as string} selectedWallet={selectedWallet} />{" "}
            {/* Pass selectedWallet directly */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
