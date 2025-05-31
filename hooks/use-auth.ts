"use client"

import { useAccount, useSignMessage } from "wagmi"
import { useEffect, useState } from "react"

interface AuthState {
  isAuthenticated: boolean
  userId: string | null
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (isConnected && address) {
      authenticateUser()
    } else {
      setAuthState({
        isAuthenticated: false,
        userId: null,
        isLoading: false,
        error: null,
      })
    }
  }, [isConnected, address])

  const authenticateUser = async () => {
    if (!address) return

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Check if user exists in our database
      const userResponse = await fetch(`/api/auth/user?address=${address}`)

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setAuthState({
          isAuthenticated: true,
          userId: userData.userId,
          isLoading: false,
          error: null,
        })
        return
      }

      // If user doesn't exist, create new user with signature verification
      const message = `Welcome to Social Signals!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`

      const signature = await signMessageAsync({ message })

      const createUserResponse = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      })

      if (createUserResponse.ok) {
        const userData = await createUserResponse.json()
        setAuthState({
          isAuthenticated: true,
          userId: userData.userId,
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error("Failed to create user")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setAuthState({
        isAuthenticated: false,
        userId: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      })
    }
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      userId: null,
      isLoading: false,
      error: null,
    })
  }

  return {
    ...authState,
    address,
    isConnected,
    authenticate: authenticateUser,
    logout,
  }
}
