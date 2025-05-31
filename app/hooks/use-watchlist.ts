"use client"

import { useState } from "react"
import type { FarcasterUser } from "../types"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<FarcasterUser[]>([])

  const addToWatchlist = (user: FarcasterUser) => {
    setWatchlist((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev
      }
      return [...prev, user]
    })
  }

  const removeFromWatchlist = (userId: string) => {
    setWatchlist((prev) => prev.filter((user) => user.id !== userId))
  }

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
  }
}
