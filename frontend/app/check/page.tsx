"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

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
          setWalletAddress(accounts[0])
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
        setWalletAddress(accounts[0])
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("Please install MetaMask!")
    }
  }

  const signMessage = async () => {
    if (!isConnected) {
      setMessage("Please connect your wallet first")
      setVerificationStatus("error")
      return
    }

    setIsVerifying(true)
    setVerificationStatus("idle")

    try {
      const message = `darkID Verification Request\nWallet: ${account}\nTimestamp: ${Date.now()}`
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      })

      // Call verification API
      const response = await fetch("http://localhost:3000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account,
          signature,
          message,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setVerificationStatus("success")
        setMessage("Verification successful! Your anonymous identity has been registered.")
      } else {
        setVerificationStatus("error")
        setMessage(result.error || "Verification failed")
      }
    } catch (error) {
      setVerificationStatus("error")
      setMessage("Error during verification process")
      console.error("Verification error:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyWalletAddress = async () => {
    if (!walletAddress) {
      setMessage("Please enter a wallet address")
      setVerificationStatus("error")
      return
    }

    setIsVerifying(true)
    setVerificationStatus("idle")

    try {
      const response = await fetch(`http://localhost:3000/verify/${walletAddress}`)
      const result = await response.json()

      if (response.ok) {
        setVerificationStatus(result.isVerified?"success":"error")
        setMessage(
          result.isVerified
            ? `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is verified ✓`
            : `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is not verified`,
        )
      } else {
        setVerificationStatus("error")
        setMessage(result.error || "Error checking verification status")
      }
    } catch (error) {
      setVerificationStatus("error")
      setMessage("Error checking wallet verification")
      console.error("Check verification error:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (walletAddress && verificationStatus !== "success") {
      verifyWalletAddress()
    }
  }, [walletAddress])

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
          {isConnected && (
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Wallet className="h-4 w-4 mr-2" />
              {account.slice(0, 6)}...{account.slice(-4)}
            </Badge>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Identity Verification
            </h1>
            <p className="text-gray-400">
              Verify your identity anonymously or check the verification status of any wallet
            </p>
          </div>

          <div className="grid gap-6">
            {/* Self Verification */}
            {/*<Card className="bg-black/40 border-purple-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-purple-400" />
                  Verify Your Identity
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Sign a message with your wallet to create an anonymous verified identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <Button
                    onClick={connectWallet}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 text-sm">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                      </p>
                    </div>
                    <Button
                      onClick={signMessage}
                      disabled={isVerifying}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Sign & Verify Identity
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>*/}

            {/* Check Other Wallets */}
            <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="h-6 w-6 mr-2 text-cyan-400" />
                  Check Wallet Verification
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter any wallet address to check its verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-gray-300">
                    Wallet Address
                  </Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-black/50 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={verifyWalletAddress}
                  disabled={isVerifying || !walletAddress}
                  variant="outline"
                  className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check Verification Status
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Status Messages */}
            {message && (
              <Alert
                className={`${
                  verificationStatus === "success"
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-red-500/50 bg-red-500/10"
                }`}
              >
                {verificationStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                <AlertDescription className={verificationStatus === "success" ? "text-green-400" : "text-red-400"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
