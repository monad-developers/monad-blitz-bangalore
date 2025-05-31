"use client"

import { useState, useEffect } from "react"
import { Search, Bell, Users, Activity, AlertTriangle, Info, History, PieChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import UserSearch from "./components/user-search"
import Watchlist from "./components/watchlist"
import Notifications from "./components/notifications"
import MyTradesTab from "./components/my-trades-tab"
import TopTraders from "./components/top-traders"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { NetworkSwitcher } from "@/components/network-switcher"
import { useAuth } from "@/hooks/use-auth"
import { useAccount } from "wagmi"
import { monadTestnet } from "@/lib/wallet-config"
import Link from "next/link"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("search")
  const { isAuthenticated, userId, isLoading, error, isConnected } = useAuth()
  const { chain } = useAccount()
  const [stats, setStats] = useState({
    watching: 0,
    signals: 0,
    unread: 0,
    watchingThisWeek: 0,
    notificationsToday: 0,
    lastNotificationTime: null as string | null,
    myTradesCount: 0,
  })

  const isOnWrongNetwork = isConnected && chain?.id !== monadTestnet.id

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetch(`/api/user/stats?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setStats((prevStats) => ({
              ...prevStats,
              watching: data.watching,
              signals: data.notifications,
              unread: data.unread,
              watchingThisWeek: data.watchingThisWeek,
              notificationsToday: data.notificationsToday,
              lastNotificationTime: data.lastNotificationTime,
            }))
          }
        })
        .catch(console.error)

      fetch("/api/monitor/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
    }
  }, [isAuthenticated, userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-wider font-mono bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                $enigma
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Live on Monad Testnet</span>
                </div>
                <NetworkSwitcher />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4" />
                    {stats.unread > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-white text-black border-0">
                        {stats.unread}
                      </Badge>
                    )}
                  </Button>
                  <Link href="/portfolio" passHref>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                      aria-label="View Portfolio"
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
              <ConnectWalletButton />
            </div>
          </div>

          {isOnWrongNetwork && (
            <Alert className="mb-6 bg-orange-500/10 border-orange-500/20">
              <Info className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-orange-300">
                You're connected to {chain?.name || "an unsupported network"}. Switch to Monad Testnet for full
                functionality.
              </AlertDescription>
            </Alert>
          )}

          {!isConnected && (
            <Alert className="mb-6 bg-white/10 border-white/20">
              <AlertTriangle className="h-4 w-4 text-white fill-white stroke-white" />
              <AlertDescription className="text-white">Link your wallet to start spying on degens</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 bg-white/10 border-white/20">
              <AlertTriangle className="h-4 w-4 text-white fill-white stroke-white" />
              <AlertDescription className="text-white">Authentication error: {error}</AlertDescription>
            </Alert>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Watching</p>
                      <p className="text-3xl font-bold text-white">{stats.watching}</p>
                      <p className="text-white text-xs mt-1">
                        {stats.watchingThisWeek > 0
                          ? `+${stats.watchingThisWeek} this week`
                          : "No new additions this week"}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Active Signals</p>
                      <p className="text-3xl font-bold text-white">{stats.signals}</p>
                      <p className="text-white text-xs mt-1">
                        {stats.notificationsToday > 0 ? `+${stats.notificationsToday} today` : "No signals today"}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Unread Alerts</p>
                      <p className="text-3xl font-bold text-white">{stats.unread}</p>
                      <p className="text-white text-xs mt-1">
                        {stats.lastNotificationTime ? `Last: ${stats.lastNotificationTime}` : "No recent alerts"}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {isAuthenticated && userId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border-gray-800 shadow-xl">
              <TabsTrigger
                value="search"
                className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Users
              </TabsTrigger>
              <TabsTrigger
                value="watchlist"
                className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Watchlist ({stats.watching})
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {stats.unread > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-white text-black border-0">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="my-trades"
                className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white text-gray-300"
              >
                <History className="h-4 w-4 mr-2" />
                My Trades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-6">
              <UserSearch currentUser={userId} onStatsUpdate={setStats} />
            </TabsContent>
            <TabsContent value="watchlist" className="mt-6">
              <Watchlist currentUser={userId} onStatsUpdate={setStats} />
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
              <Notifications currentUser={userId} onStatsUpdate={setStats} />
            </TabsContent>
            <TabsContent value="my-trades" className="mt-6">
              <MyTradesTab currentUser={userId} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-white/10 border-white/20 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">$ enigma --init</h2>
                </div>
                <TopTraders limit={5} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
