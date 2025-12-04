"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationItem {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
  duration?: number
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const addNotification = (notification: Omit<NotificationItem, "id">) => {
    const id = Date.now().toString()
    const item = { ...notification, id }
    setNotifications((prev) => [...prev, item])

    if (notification.duration !== 0) {
      setTimeout(() => removeNotification(id), notification.duration || 5000)
    }
  }

  const unreadCount = notifications.length

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-3 ${
                    notification.type === "error"
                      ? "bg-red-50 dark:bg-red-950"
                      : notification.type === "success"
                        ? "bg-green-50 dark:bg-green-950"
                        : "bg-blue-50 dark:bg-blue-950"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
