"use client"

import { useState, useEffect } from "react"
import { Clock, TrendingUp, TrendingDown, Eye, ExternalLink, Loader2, RefreshCw } from "lucide-react" // Added RefreshCw
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CopyTradeModal from "./copy-trade-modal"
import type { Notification, Transaction } from "@/lib/types" // Ensure Transaction is imported

interface NotificationsProps {
  currentUser: string
  onStatsUpdate: (stats: any) => void
}

export default function Notifications({ currentUser, onStatsUpdate }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showCopyTradeModal, setShowCopyTradeModal] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${currentUser}`)
      const data = await response.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        const unreadCount = data.notifications.filter((n: Notification) => !n.read).length
        onStatsUpdate((prev: any) => ({ ...prev, signals: data.notifications.length, unread: unreadCount }))
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead((prev) => new Set(prev).add(notificationId))
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
        onStatsUpdate((prev: any) => ({ ...prev, unread: prev.unread - 1 }))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }
  }

  const handleCopyTrade = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowCopyTradeModal(true)
  }

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case "swap":
        return <RefreshCw className="h-4 w-4 text-blue-400" />
      case "mint":
        return <TrendingUp className="h-4 w-4 text-purple-400" /> // Example for mint
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" /> // Default/transfer
    }
  }

  const getActionColor = (action?: string) => {
    switch (action) {
      case "buy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "sell":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "swap":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "mint":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getActionText = (tx: Transaction): string => {
    if (tx.action === "swap") {
      return `swapped ${tx.inputTokenSymbol || "tokens"} for ${tx.outputTokenSymbol || "tokens"}`
    }
    return `${tx.action || "interacted with"} ${tx.tokenSymbol || (tx.value !== "0" ? "MON" : "tokens")}`
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-gray-300 mt-2">Loading notifications...</p>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <p className="text-gray-300">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-2">You'll see trading activity from your watchlist here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Trading Notifications</CardTitle>
            <CardDescription className="text-gray-300">
              Real-time alerts from your Farcaster social graph on Monad
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const tx = notification.transaction as Transaction // Cast for richer type
            return (
              <Card
                key={notification.id}
                className={`bg-gray-900 border-gray-800 shadow-xl hover:bg-gray-800 transition-all duration-200 ${
                  !notification.read ? "ring-2 ring-purple-400/50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-400/50">
                        <AvatarImage
                          src={notification.traderPfp || "/placeholder.svg"}
                          alt={notification.traderDisplayName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          {notification.traderDisplayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActionIcon(tx.action)}
                          <span className="font-semibold text-white">{notification.traderDisplayName}</span>
                          <span className="text-gray-300">{getActionText(tx)}</span>
                          {!notification.read && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">New</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mb-2">Method: {tx.parsedMethodName || "N/A"}</div>

                        <div className="space-y-2">
                          {tx.action === "swap" ? (
                            <>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">Input:</span>
                                <span className="font-medium text-white">
                                  {tx.inputTokenAmount || tx.value /* fallback to native value */}{" "}
                                  {tx.inputTokenSymbol || (tx.value !== "0" ? "MON" : "")}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-400">Output:</span>
                                <span className="font-medium text-white">
                                  {tx.outputTokenAmount || "..."} {tx.outputTokenSymbol || ""}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">Amount:</span>
                              <span className="font-medium text-white">
                                {tx.value} {tx.tokenSymbol || (tx.value !== "0" ? "MON" : "")}
                              </span>
                              {tx.tokenName && tx.tokenSymbol !== "MON" && (
                                <>
                                  <span className="text-gray-400">Token:</span>
                                  <span className="font-medium text-white">{tx.tokenName}</span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">Network:</span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                            >
                              Monad
                            </Badge>
                            <span className="text-gray-400">Block:</span>
                            <span className="text-white font-mono text-xs">{tx.blockNumber}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>
                              {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingAsRead.has(notification.id)}
                          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        >
                          {markingAsRead.has(notification.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://testnet.monadexplorer.com/tx/${tx.hash}`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCopyTrade(notification)}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0 disabled:opacity-50"
                        disabled // Add this prop
                      >
                        Copy Trade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Copy Trade Modal */}
      <CopyTradeModal
        isOpen={showCopyTradeModal}
        onClose={() => setShowCopyTradeModal(false)}
        notification={selectedNotification}
      />
    </>
  )
}
