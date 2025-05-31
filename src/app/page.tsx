"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Coins, Play, Plus, Wallet, Crown, Timer, Target, Star, Zap } from "lucide-react"
import { getWalletInformation, checkWalletConnection, disconnectWallet } from "@/lib/wallet"

interface WalletInfo {
  address: string;
  network: string;
  chainId: string;
  balance: string;
}

export default function GamingPlatform() {
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

  const featuredGames = [
    {
      id: 1,
      title: "Kaboom Platformer",
      creator: "MonadHack Team",
      prize: "1000 MONAD",
      players: 1,
      difficulty: "Medium",
      image: "/game-preview.jpg",
      icon: "🎮",
      description: "A classic platformer game with multiple levels, enemies, and power-ups built with Kaboom.js",
      tags: ["Platformer", "Action", "Retro"]
    },
    {
      id: 2,
      title: "Space Adventure",
      creator: "Indie Dev",
      prize: "500 MONAD",
      players: 1,
      difficulty: "Hard",
      image: "/space-game.jpg",
      icon: "🚀",
      description: "Explore the cosmos in this thrilling space adventure game",
      tags: ["Space", "Adventure", "Sci-Fi"]
    },
    {
      id: 3,
      title: "Sky Jumper",
      creator: "CloudNine",
      prize: "800 GAME",
      players: 2156,
      difficulty: "Hard",
      image: "/placeholder.svg?height=200&width=300",
      icon: "☁️",
      description: "Jump through the clouds in this exciting platformer",
      tags: ["Platformer", "Casual"]
    },
  ]

  const leaderboard = [
    { rank: 1, player: "CryptoGamer", score: 125000, tokens: "2,500 GAME" },
    { rank: 2, player: "BlockchainBeast", score: 118000, tokens: "1,800 GAME" },
    { rank: 3, player: "DefiDaredevil", score: 112000, tokens: "1,200 GAME" },
    { rank: 4, player: "NFTNinja", score: 108000, tokens: "800 GAME" },
    { rank: 5, player: "MetaverseMaster", score: 105000, tokens: "500 GAME" },
  ]

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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Create. Play. <span className="text-purple-400">Win.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Build hyper-casual platformer games on-chain and compete for real prizes. Fair, transparent, and
            decentralized gaming for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/play">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                disabled={!walletInfo}
              >
                <Play className="h-5 w-5 mr-2" />
                Join
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white text-lg px-8 py-4"
                disabled={!walletInfo}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create
              </Button>
            </Link>
          </div>
          {!walletInfo && (
            <p className="text-gray-400 text-sm mt-4">
              Connect your wallet to start playing and creating games
            </p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400">12,547</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">₿ 45.2</div>
              <div className="text-gray-400">Total Prizes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">1,892</div>
              <div className="text-gray-400">Games Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">98.7%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
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
