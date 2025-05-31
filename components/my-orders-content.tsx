"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Filter } from "lucide-react"
import { mockTransactions } from "@/lib/mock-data"

export function MyOrdersContent() {
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals">("all")

  const filteredTransactions = mockTransactions.filter((transaction) => {
    if (filter === "all") return true
    if (filter === "deposits") return transaction.type === "deposit"
    if (filter === "withdrawals") return transaction.type === "withdrawal"
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Deposit</Button>
          <Button variant="outline" className="border-[#1a2c3a] bg-[#0d1924]">
            Withdraw
          </Button>
        </div>
      </div>

      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg p-4 flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-400">Available Balance</div>
          <div className="text-2xl font-bold text-emerald-400">5,280.00 coins</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Total Deposits</div>
            <div className="font-medium">10,000.00 coins</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Total Withdrawals</div>
            <div className="font-medium">2,500.00 coins</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
        <div className="flex justify-between items-center mb-2">
          <TabsList className="bg-[#0d1924] border border-[#1a2c3a]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#162736]">
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="deposits" className="data-[state=active]:bg-[#162736]">
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-[#162736]">
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="border-[#1a2c3a] bg-[#0d1924]">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <TabsContent value="all" className="mt-2">
          <TransactionsList transactions={filteredTransactions} />
        </TabsContent>
        <TabsContent value="deposits" className="mt-2">
          <TransactionsList transactions={filteredTransactions} />
        </TabsContent>
        <TabsContent value="withdrawals" className="mt-2">
          <TransactionsList transactions={filteredTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransactionsList({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg p-8 text-center">
        <p className="text-gray-400">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1924] border border-[#1a2c3a] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#162736] text-sm text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left">Date & Time</th>
            <th className="px-4 py-3 text-left">Transaction ID</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a2c3a]">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-[#0f1e29]">
              <td className="px-4 py-3 text-sm">{transaction.date}</td>
              <td className="px-4 py-3 text-sm font-mono">{transaction.id}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {transaction.type === "deposit" ? (
                    <ArrowDown className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-amber-400" />
                  )}
                  <span className="capitalize">{transaction.type}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className={transaction.type === "deposit" ? "text-emerald-400" : "text-amber-400"}>
                  {transaction.type === "deposit" ? "+" : "-"}
                  {transaction.amount.toFixed(2)} coins
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <Badge
                  className={
                    transaction.status === "completed"
                      ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                      : transaction.status === "pending"
                        ? "bg-amber-900/30 text-amber-400 border-amber-800"
                        : "bg-red-900/30 text-red-400 border-red-800"
                  }
                >
                  {transaction.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
