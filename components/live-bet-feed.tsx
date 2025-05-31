"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"
import { generateMockBet } from "@/lib/mock-data"

export function LiveBetFeed() {
  const [liveBets, setLiveBets] = useState<any[]>([])
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Add initial bets
    setLiveBets([generateMockBet(), generateMockBet(), generateMockBet()])

    // Add a new bet every 3-8 seconds
    const interval = setInterval(
      () => {
        setLiveBets((prev) => {
          const newBets = [generateMockBet(), ...prev]
          // Keep only the last 20 bets
          return newBets.slice(0, 20)
        })
      },
      Math.random() * 5000 + 3000,
    )

    return () => clearInterval(interval)
  }, [])

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-[#162736] border border-[#1a2c3a] rounded-lg p-3 cursor-pointer shadow-lg z-50"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-medium">Live Bets</span>
          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800">{liveBets.length}</Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden shadow-lg z-50">
      <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="font-medium">Live Bets</h3>
          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800">{liveBets.length}</Badge>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-white" onClick={() => setIsMinimized(true)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 space-y-2">
        {liveBets.map((bet, index) => (
          <div key={index} className="bg-[#162736] p-2 rounded border border-[#1a2c3a] text-sm animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-emerald-900 text-emerald-200 text-xs">
                  {bet.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{bet.user}</span>
              <span className="text-xs text-gray-400">just now</span>
            </div>
            <div className="pl-8">
              <p>
                Bet <span className="text-emerald-400">{bet.amount} coins</span> on{" "}
                <span className="font-medium">{bet.prediction}</span>
              </p>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>{bet.match}</span>
                <span>Odds: {bet.odds.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
