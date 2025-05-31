"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Wallet, Users, Search, CheckCircle, XCircle, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"

interface VerificationRecord {
  address: string
  transactionHash: string
  verifiedAt: string
}

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [verifications, setVerifications] = useState<VerificationRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkConnection()
    fetchVerifications()
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

  const fetchVerifications = async () => {
    try {
      const response = await fetch("http://localhost:3000/verified-users")
      const data = await response.json()
      setVerifications(data.users || [])
    } catch (error) {
      console.error("Error fetching verifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVerifications = verifications.filter(
    (v) =>
      v.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: verifications.length+3,
    verified: verifications.length,
    pending: 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-purple-400" />
            <Shield className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              darkID
            </span>
          </Link>
          <div className="flex items-center space-x-4">
          <Link href="/check">
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
                Check
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="ghost" className="text-purple-300 hover:text-purple-100">
                Verify
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

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Verification Dashboard
          </h1>
          <p className="text-gray-400">Monitor anonymous identity verifications across the darkID network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Identities</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-gray-500">Registered in network</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-green-500/30 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.verified}</div>
              <p className="text-xs text-gray-500">Anonymous verified</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <p className="text-xs text-gray-500">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search Verifications</CardTitle>
            <CardDescription className="text-gray-400">Search by wallet address or anonymous ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search wallet address or anonymous ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Verifications List */}
        <Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Verification Records</CardTitle>
            <CardDescription className="text-gray-400">
              All anonymous identity verifications in the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading verifications...</div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? "No verifications found matching your search." : "No verifications found."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((verification, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">

                        <CheckCircle className="h-5 w-5 text-green-400" />
                      
                      <div>
                        <div className="text-white font-medium">
                          {verification.address.slice(0, 6)}...{verification.address.slice(-4)}
                        </div>
                        
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={"default"}
                        className={
                          "bg-green-500/20 text-green-400"
                        }
                      >
                        {"Verified"}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {new Date(verification.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
