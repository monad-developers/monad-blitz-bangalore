"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, XCircle, Filter } from "lucide-react"
import { mockUserBets } from "@/lib/mock-data"

export function MyBetsContent() {
  const [filter, setFilter] = useState<"all" | "active" | "settled">("all")

  const filteredBets = mockUserBets.filter((bet) => {
    if (filter === "all") return true
    if (filter === "active") return bet.status === "pending"
    if (filter === "settled") return bet.status === "won" || bet.status === "lost"
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bets</h1>
        <Button variant="outline" size="sm" className="border-[#1a2c3a] bg-[#0d1924]">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="bg-[#0d1924] border border-[#1a2c3a]">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#162736]">
            All Bets
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-[#162736]">
            Active
          </TabsTrigger>
          <TabsTrigger value="settled" className="data-[state=active]:bg-[#162736]">
            Settled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <BetsList bets={filteredBets} />
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <BetsList bets={filteredBets} />
        </TabsContent>
        <TabsContent value="settled" className="mt-4">
          <BetsList bets={filteredBets} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BetsList({ bets }: { bets: any[] }) {
  if (bets.length === 0) {
    return (
      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg p-8 text-center">
        <p className="text-gray-400">No bets found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <div key={bet.id} className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
          <div className="bg-[#162736] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{bet.match}</h3>
              <span className="text-sm text-gray-400">{bet.date}</span>
            </div>
            <div className="flex items-center gap-2">
              {bet.status === "won" && (
                <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  WON
                </Badge>
              )}
              {bet.status === "lost" && (
                <Badge className="bg-red-900/30 text-red-400 border-red-800 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  LOST
                </Badge>
              )}
              {bet.status === "pending" && (
                <Badge className="bg-amber-900/30 text-amber-400 border-amber-800 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  PENDING
                </Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <h4 className="font-medium">{bet.question}</h4>
              <p className="text-sm text-gray-400">
                Your prediction: <span className="text-white">{bet.prediction}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Bet Amount</div>
                <div className="font-medium">{bet.amount} coins</div>
              </div>
              <div>
                <div className="text-gray-400">Odds</div>
                <div className="font-medium">{bet.odds.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-gray-400">Potential Win</div>
                <div className="font-medium">{(bet.amount * bet.odds).toFixed(2)} coins</div>
              </div>
              <div>
                <div className="text-gray-400">Result</div>
                <div className="font-medium">{bet.status === "pending" ? "-" : bet.result || "Not available"}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
