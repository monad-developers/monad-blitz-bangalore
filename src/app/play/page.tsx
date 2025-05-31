"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Trophy, Coins, Users, Timer, Play, Crown, Wallet } from "lucide-react"
import { getWalletInformation, checkWalletConnection, disconnectWallet } from "@/lib/wallet"

interface WalletInfo {
  address: string;
  network: string;
  chainId: string;
  balance: string;
}

export default function PlayPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = await checkWalletConnection()
        if (connection) {
          setWalletInfo(connection)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
    
    checkConnection()
  }, [])

  const handleWalletConnect = async () => {
    if (walletInfo) {
      // Disconnect wallet
      disconnectWallet()
      setWalletInfo(null)
      setError(null)
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const connection = await getWalletInformation()
      setWalletInfo(connection)
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
      console.error("Wallet connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const featuredGames = [
    {
      id: 1,
      title: "Neon Runner",
      creator: "GameDev123",
      prize: "500 GAME",
      players: 1247,
      difficulty: "Easy",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Crystal Caves",
      creator: "PixelMaster",
      prize: "1,200 GAME",
      players: 892,
      difficulty: "Medium",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Sky Jumper",
      creator: "CloudNine",
      prize: "800 GAME",
      players: 2156,
      difficulty: "Hard",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Pixel Adventure",
      creator: "RetroGamer",
      prize: "650 GAME",
      players: 1543,
      difficulty: "Medium",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      title: "Space Hopper",
      creator: "CosmicDev",
      prize: "900 GAME",
      players: 987,
      difficulty: "Hard",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      title: "Forest Quest",
      creator: "NatureGames",
      prize: "400 GAME",
      players: 2341,
      difficulty: "Easy",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 7,
      title: "Sky Temple",
      creator: "ChainJump Team",
      prize: "3 Levels",
      players: 756,
      difficulty: "Medium",
      image: "/placeholder.svg?height=200&width=300",
      gameKey: "0x003"
    },
    {
      id: 8,
      title: "Underground Maze",
      creator: "ChainJump Team", 
      prize: "5 Levels",
      players: 432,
      difficulty: "Hard",
      image: "/placeholder.svg?height=200&width=300",
      gameKey: "0x004"
    },
    {
      id: 9,
      title: "Speed Run Arena",
      creator: "ChainJump Team",
      prize: "3 Levels", 
      players: 1089,
      difficulty: "Hard",
      image: "/placeholder.svg?height=200&width=300",
      gameKey: "0x005"
    },
    {
      id: 10,
      title: "Mystic Chambers",
      creator: "ChainJump Team",
      prize: "4 Levels",
      players: 623,
      difficulty: "Medium",
      image: "/placeholder.svg?height=200&width=300", 
      gameKey: "0x006"
    },
  ]

  const leaderboard = [
    { rank: 1, player: "SpeedDemon", score: 15420, tokens: 2500 },
    { rank: 2, player: "JumpMaster", score: 14890, tokens: 2000 },
    { rank: 3, player: "CoinHunter", score: 14230, tokens: 1500 },
    { rank: 4, player: "PlatformPro", score: 13980, tokens: 1000 },
    { rank: 5, player: "GameChamp", score: 13750, tokens: 800 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">ChainJump</span>
          </Link>
          <div className="flex items-center space-x-4">
            {walletInfo && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">{walletInfo.balance} MONAD</span>
              </div>
            )}
            <Button
              onClick={handleWalletConnect}
              disabled={isConnecting}
              variant={walletInfo ? "secondary" : "default"}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnecting 
                ? "Connecting..." 
                : walletInfo 
                  ? formatAddress(walletInfo.address)
                  : "Connect Wallet"
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 mx-4 mt-4 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Back Button */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Link href="/">
            <Button
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white mb-6"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
      </section>

      {/* Games Gallery */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Available <span className="text-purple-400">Games</span>
          </h2>
          
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-purple-800/30 mb-8">
              <TabsTrigger value="games" className="data-[state=active]:bg-purple-600">
                Featured Games
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="data-[state=active]:bg-purple-600">
                Tournaments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Game 0x001 */}
                <Card className="bg-black/40 border-purple-800/30 hover:border-purple-600/50 transition-all">
                  <CardHeader className="pb-3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Game 0x001"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Game 0x001</CardTitle>
                        <CardDescription className="text-gray-400">by ChainJump Team</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        Easy
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">4 Levels</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>1,234</span>
                      </div>
                    </div>
                    <Button 
                      asChild
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={!walletInfo}
                    >
                      <Link href="/game/0x001">
                        <Play className="h-4 w-4 mr-2" />
                        {walletInfo ? "Play Now" : "Connect Wallet to Play"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Game 0x002 */}
                <Card className="bg-black/40 border-purple-800/30 hover:border-purple-600/50 transition-all">
                  <CardHeader className="pb-3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Game 0x002"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Game 0x002</CardTitle>
                        <CardDescription className="text-gray-400">by ChainJump Team</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                        Medium
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">2 Levels</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>892</span>
                      </div>
                    </div>
                    <Button 
                      asChild
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={!walletInfo}
                    >
                      <Link href="/game/0x002">
                        <Play className="h-4 w-4 mr-2" />
                        {walletInfo ? "Play Now" : "Connect Wallet to Play"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Game 0xABC */}
                <Card className="bg-black/40 border-purple-800/30 hover:border-purple-600/50 transition-all">
                  <CardHeader className="pb-3">
                    <img
                      src="/placeholder.svg?height=200&width=300"
                      alt="Game 0xABC"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Game 0xABC</CardTitle>
                        <CardDescription className="text-gray-400">by ChainJump Team</CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-red-600/20 text-red-300">
                        Hard
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Trophy className="h-4 w-4" />
                        <span className="font-semibold">1 Level</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>567</span>
                      </div>
                    </div>
                    <Button 
                      asChild
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={!walletInfo}
                    >
                      <Link href="/game/0xABC">
                        <Play className="h-4 w-4 mr-2" />
                        {walletInfo ? "Play Now" : "Connect Wallet to Play"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Featured Games */}
                {featuredGames.map((game) => (
                  <Card
                    key={game.id}
                    className="bg-black/40 border-purple-800/30 hover:border-purple-600/50 transition-all"
                  >
                    <CardHeader className="pb-3">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{game.title}</CardTitle>
                          <CardDescription className="text-gray-400">by {game.creator}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {game.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Trophy className="h-4 w-4" />
                          <span className="font-semibold">{game.prize}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{game.players}</span>
                        </div>
                      </div>
                      {game.gameKey ? (
                        <Button 
                          asChild
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={!walletInfo}
                        >
                          <Link href={`/game/${game.gameKey}`}>
                            <Play className="h-4 w-4 mr-2" />
                            {walletInfo ? "Play Now" : "Connect Wallet to Play"}
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          disabled={!walletInfo}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {walletInfo ? "Play Now" : "Connect Wallet to Play"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-8">
              <Card className="bg-black/40 border-purple-800/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Top players competing for the ultimate prize pool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((player) => (
                      <div
                        key={player.rank}
                        className="flex items-center justify-between p-4 rounded-lg bg-purple-900/20 border border-purple-800/30"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              player.rank === 1
                                ? "bg-yellow-500 text-black"
                                : player.rank === 2
                                  ? "bg-gray-400 text-black"
                                  : player.rank === 3
                                    ? "bg-amber-600 text-black"
                                    : "bg-purple-600 text-white"
                            }`}
                          >
                            {player.rank}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{player.player}</div>
                            <div className="text-sm text-gray-400">Score: {player.score.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">{player.tokens}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-black/40 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Weekly Championship</CardTitle>
                    <CardDescription className="text-gray-400">
                      Compete for the biggest prize pool of the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prize Pool</span>
                      <span className="text-yellow-400 font-semibold">5,000 GAME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="text-white">50 GAME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players</span>
                      <span className="text-white">847/1000</span>
                    </div>
                    <Progress value={84.7} className="h-2" />
                    <Button 
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      disabled={!walletInfo}
                    >
                      {walletInfo ? "Join Tournament" : "Connect Wallet to Join"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Speed Run Challenge</CardTitle>
                    <CardDescription className="text-gray-400">
                      Beat the clock in this fast-paced tournament
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prize Pool</span>
                      <span className="text-yellow-400 font-semibold">2,500 GAME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="text-white">25 GAME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Limit</span>
                      <span className="text-white">2 hours</span>
                    </div>
                    <div className="flex items-center space-x-2 text-red-400">
                      <Timer className="h-4 w-4" />
                      <span>Starts in 1h 23m</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                      disabled={!walletInfo}
                    >
                      {walletInfo ? "Set Reminder" : "Connect Wallet"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-purple-800/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gamepad2 className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">ChainJump</span>
              </div>
              <p className="text-gray-400">
                The future of hyper-casual gaming on blockchain. Create, play, and win together.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Game Creator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Tournaments
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Reddit
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Bug Reports
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-800/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ChainJump. All rights reserved. Built on blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 