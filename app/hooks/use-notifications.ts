"use client"

import { useState } from "react"
import type { Notification } from "../types"
import { mockNotifications } from "../data/mock-data"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return {
    notifications,
    markAsRead,
    markAllAsRead,
  }
}
