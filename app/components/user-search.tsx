"use client"

import { useState } from "react"
import { Search, Plus, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { FarcasterUser } from "@/lib/types"

interface UserSearchProps {
  currentUser: string
  onStatsUpdate: (stats: any) => void
}

export default function UserSearch({ currentUser, onStatsUpdate }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FarcasterUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addingUsers, setAddingUsers] = useState<Set<number>>(new Set())

  const handleOpenFarcasterProfile = (user: FarcasterUser) => {
    const farcasterUrl = `https://warpcast.com/${user.username}`
    window.open(farcasterUrl, "_blank", "noopener,noreferrer")
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.users) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToWatchlist = async (user: FarcasterUser) => {
    setAddingUsers((prev) => new Set(prev).add(user.fid))

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watcherUserId: currentUser,
          watchedUserId: user.fid.toString(),
        }),
      })

      if (response.ok) {
        // Update stats
        onStatsUpdate((prev: any) => ({ ...prev, watching: prev.watching + 1 }))
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    } finally {
      setAddingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(user.fid)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/90 border-gray-800 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Search Farcaster Users</CardTitle>
          <CardDescription className="text-gray-300">
            Find users to add to your watchlist and get notified of their Monad trading activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by username or display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 bg-gray-800/90 border-gray-700 text-white placeholder:text-gray-400 backdrop-blur-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Search Results</h3>
          <div className="grid gap-4">
            {searchResults.map((user) => (
              <Card
                key={user.fid}
                className="bg-gray-900/90 border-gray-800 shadow-xl hover:bg-gray-800/90 transition-all duration-200 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white/50">
                        <AvatarImage src={user.pfpUrl || "/placeholder.svg"} alt={user.displayName} />
                        <AvatarFallback className="bg-gray-700 text-white">
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
                        <p className="text-xs text-gray-400 mt-1">{user.followerCount.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenFarcasterProfile(user)}
                        className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50 backdrop-blur-sm"
                        title={`View @${user.username} on Farcaster`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleAddToWatchlist(user)}
                        disabled={addingUsers.has(user.fid)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                      >
                        {addingUsers.has(user.fid) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {addingUsers.has(user.fid) ? "Adding..." : "Add to Watchlist"}
                      </Button>
                    </div>
                  </div>
                  {user.bio && <p className="text-sm text-gray-300 mt-3 pl-16">{user.bio}</p>}
                  <div className="flex items-center gap-2 mt-3 pl-16">
                    <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {user.connectedAddresses.length} wallet{user.connectedAddresses.length !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                      FID: {user.fid}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card className="bg-gray-900/90 border-gray-800 shadow-xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-300">No users found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try searching with a different username or display name</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
