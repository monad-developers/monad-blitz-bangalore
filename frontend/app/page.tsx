"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Users, Zap, ArrowRight, Wallet, CheckCircle } from "lucide-react"

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setIsConnected(true)
        setAccount(accounts[0])
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("Please install MetaMask!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              darkID
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
                Dashboard
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
                Verify
              </Button>
            </Link>
            <Link href="/check">
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
                Check
              </Button>
            </Link>
            {isConnected ? (
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Wallet className="h-4 w-4 mr-2" />
                {account.slice(0, 6)}...{account.slice(-4)}
              </Badge>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Decentralized Identity Protocol
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Anonymous Verified Identity
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Prove your identity without revealing who you are. darkID enables platforms to verify users while
            maintaining complete anonymity through blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/verify">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-lg px-8 py-6"
              >
                Start Verification
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-6"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">How darkID Works</h2>
          <p className="text-gray-400 text-lg">Three core principles that power anonymous verification</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Anonymous Verification</CardTitle>
              <CardDescription className="text-gray-400">
                Verify your identity without revealing personal information. Your verification status is
                cryptographically proven.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl">
            <CardHeader>
              <Eye className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">Zero Knowledge</CardTitle>
              <CardDescription className="text-gray-400">
                Platforms can verify you're a real, unique user without accessing any personal data or tracking
                behavior.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-xl">
            <CardHeader>
              <Users className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Decentralized Trust</CardTitle>
              <CardDescription className="text-gray-400">
                No central authority controls your identity. The blockchain ensures immutable verification records.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-purple-400">1,247</div>
            <div className="text-gray-400">Verified Identities</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-cyan-400">100%</div>
            <div className="text-gray-400">Anonymous</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-green-400">0</div>
            <div className="text-gray-400">Data Breaches</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-yellow-400">24/7</div>
            <div className="text-gray-400">Decentralized</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Go Anonymous?</h3>
            <p className="text-gray-300 mb-8 text-lg">
              Join the future of identity verification. Maintain your privacy while proving your authenticity.
            </p>
            {isConnected ? (
              <Link href="/verify">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-lg px-8 py-6"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Start Verification Process
                </Button>
              </Link>
            ) : (
              <Button
                onClick={connectWallet}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-lg px-8 py-6"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet to Begin
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2024 darkID. Decentralized. Anonymous. Verified.</p>
        </div>
      </footer>
    </div>
  )
}
