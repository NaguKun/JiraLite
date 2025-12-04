"use client"

import { useState } from "react"
import { Bell, Trash2, CheckCircle2, Mail, MessageSquare, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Notification {
  id: string
  type: "assignment" | "comment" | "mention" | "status" | "invite"
  title: string
  description: string
  timestamp: Date
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "assignment",
      title: "Assigned to you",
      description: 'You were assigned to "Fix authentication bug" by Alex Johnson',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
    },
    {
      id: "2",
      type: "comment",
      title: "New comment",
      description: 'Sarah commented on "Login page responsive design": Great progress on mobile design...',
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: false,
    },
    {
      id: "3",
      type: "mention",
      title: "You were mentioned",
      description: 'Mike mentioned you in a comment: "@You - can you review this?',
      timestamp: new Date(Date.now() - 5 * 3600000),
      read: false,
    },
    {
      id: "4",
      type: "status",
      title: "Status changed",
      description: '"Database migration" was moved to In Review',
      timestamp: new Date(Date.now() - 24 * 3600000),
      read: true,
    },
    {
      id: "5",
      type: "invite",
      title: "Team invitation",
      description: 'You were invited to join the "Product" team by Sarah',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000),
      read: true,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <Users className="w-5 h-5 text-blue-500" />
      case "comment":
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      case "mention":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case "status":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "invite":
        return <Mail className="w-5 h-5 text-pink-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">You have {unreadCount} unread notification(s)</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="border-border text-foreground bg-transparent">
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? "bg-background border-border"
                    : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.timestamp)}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {!notification.read && (
                      <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)} className="text-xs">
                        Read
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
