"use client"

import { useState, useEffect } from "react"
import { Trash2, ExternalLink, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { WatchlistUser } from "@/lib/types"

interface WatchlistProps {
  currentUser: string
  onStatsUpdate: (stats: any) => void
}

export default function Watchlist({ currentUser, onStatsUpdate }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [removingUsers, setRemovingUsers] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchWatchlist()
  }, [currentUser])

  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`/api/watchlist?userId=${currentUser}`)
      const data = await response.json()

      if (data.watchlist) {
        setWatchlist(data.watchlist)
        onStatsUpdate((prev: any) => ({ ...prev, watching: data.watchlist.length }))
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (user: WatchlistUser) => {
    setRemovingUsers((prev) => new Set(prev).add(user.fid))

    try {
      const response = await fetch(`/api/watchlist?watcherUserId=${currentUser}&watchedUserId=${user.fid}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setWatchlist((prev) => prev.filter((u) => u.fid !== user.fid))
        onStatsUpdate((prev: any) => ({ ...prev, watching: prev.watching - 1 }))
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    } finally {
      setRemovingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(user.fid)
        return newSet
      })
    }
  }

  const handleOpenFarcasterProfile = (user: WatchlistUser) => {
    const farcasterUrl = `https://warpcast.com/${user.username}`
    window.open(farcasterUrl, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-gray-300 mt-2">Loading watchlist...</p>
        </CardContent>
      </Card>
    )
  }

  if (watchlist.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <p className="text-gray-300">Your watchlist is empty</p>
          <p className="text-sm text-gray-400 mt-2">Search for users to add them to your watchlist</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Your Watchlist</CardTitle>
          <CardDescription className="text-gray-300">
            Users you're monitoring for trading activity on Monad
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {watchlist.map((user) => (
          <Card
            key={user.fid}
            className="bg-gray-900 border-gray-800 shadow-xl hover:bg-gray-800 transition-all duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Link href={`/user/${user.fid}`} className="flex items-center gap-4 flex-1 hover:opacity-90">
                  <Avatar className="h-12 w-12 ring-2 ring-purple-400/50">
                    <AvatarImage src={user.pfpUrl || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{user.displayName}</h4>
                      {user.verifications.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">@{user.username}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-400">{user.followerCount.toLocaleString()} followers</p>
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {user.connectedAddresses.length} wallet{user.connectedAddresses.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                    <p className="text-xs text-gray-400">Monitoring</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenFarcasterProfile(user)}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                    title={`View @${user.username} on Farcaster`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(user)}
                    disabled={removingUsers.has(user.fid)}
                    className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  >
                    {removingUsers.has(user.fid) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 pl-16">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Live Monitoring
                  </Badge>
                  <span className="text-gray-400">Added {new Date(user.addedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Watching {user.connectedAddresses.length} address{user.connectedAddresses.length !== 1 ? "es" : ""}{" "}
                  for Monad activity
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
