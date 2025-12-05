"use client"

import { Bell, Trash2, CheckCircle2, Mail, MessageSquare, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

export default function NotificationsPage() {
  const { session } = useAuth()
  const { data: notifications, isLoading, error, refetch } = useNotifications()
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead, isLoading: isMarkingAllAsRead } = useMarkAllAsRead()

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      refetch()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(undefined)
      toast.success("All notifications marked as read")
      refetch()
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!session?.access_token) return

    try {
      await api.notifications.deleteNotification(notificationId, session.access_token)
      toast.success("Notification deleted")
      refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete notification"
      toast.error(message)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
      case "ISSUE_ASSIGNED":
        return <Users className="w-5 h-5 text-blue-500" />
      case "comment":
      case "NEW_COMMENT":
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      case "mention":
      case "MENTION":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case "status":
      case "ISSUE_STATUS_CHANGED":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "invite":
      case "TEAM_INVITATION":
        return <Mail className="w-5 h-5 text-pink-500" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
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

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold">Failed to load notifications</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

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
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="border-border text-foreground bg-transparent"
            >
              {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {!notifications || notifications.length === 0 ? (
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
                  notification.is_read
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
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs"
                      >
                        Read
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
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
