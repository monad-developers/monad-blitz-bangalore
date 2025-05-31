"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Calendar } from "lucide-react"
import { mockLeaderboard } from "@/lib/mock-data"

export function LeaderboardContent() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "allTime">("weekly")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Last updated: 5 minutes ago</span>
        </div>
      </div>

      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
        <div className="bg-[#162736] p-4">
          <Tabs defaultValue="weekly" className="w-full" onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList className="bg-[#0a1218] border border-[#1a2c3a]">
              <TabsTrigger value="daily" className="data-[state=active]:bg-[#162736]">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-[#162736]">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-[#162736]">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="allTime" className="data-[state=active]:bg-[#162736]">
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <LeaderboardTable users={mockLeaderboard} />
            </TabsContent>
            <TabsContent value="weekly" className="mt-4">
              <LeaderboardTable users={mockLeaderboard} />
            </TabsContent>
            <TabsContent value="monthly" className="mt-4">
              <LeaderboardTable users={mockLeaderboard} />
            </TabsContent>
            <TabsContent value="allTime" className="mt-4">
              <LeaderboardTable users={mockLeaderboard} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function LeaderboardTable({ users }: { users: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="text-sm text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left">Rank</th>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-right">Profit</th>
            <th className="px-4 py-3 text-right">Win Rate</th>
            <th className="px-4 py-3 text-right">Bets</th>
            <th className="px-4 py-3 text-center">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a2c3a]">
          {users.map((user, index) => (
            <tr key={user.id} className={index < 3 ? "bg-[#162736]/30" : "hover:bg-[#0f1e29]"}>
              <td className="px-4 py-3">
                {index === 0 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500">
                    1
                  </div>
                )}
                {index === 1 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/20 text-gray-300">
                    2
                  </div>
                )}
                {index === 2 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/20 text-amber-700">
                    3
                  </div>
                )}
                {index > 2 && <div className="px-3">{index + 1}</div>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-900 text-emerald-200">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-400">Member since {user.memberSince}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-emerald-400">+{user.profit.toFixed(2)} coins</span>
              </td>
              <td className="px-4 py-3 text-right">{user.winRate}%</td>
              <td className="px-4 py-3 text-right">{user.totalBets}</td>
              <td className="px-4 py-3 text-center">
                {user.trend === "up" ? (
                  <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800">
                    <TrendingUp className="h-3 w-3 mr-1" /> Up
                  </Badge>
                ) : (
                  <Badge className="bg-red-900/30 text-red-400 border-red-800">
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> Down
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
