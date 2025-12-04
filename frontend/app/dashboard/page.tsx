"use client"

import { useState } from "react"
import { Bell, Zap, AlertCircle, CheckCircle2, Clock, Users, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
  id: string
  type: "assignment" | "comment" | "mention" | "status-change"
  title: string
  description: string
  timestamp: Date
  read: boolean
  avatar?: string
}

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  timestamp: Date
  icon: "comment" | "status" | "created" | "assigned"
}

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "assignment",
      title: "Assigned to you",
      description: "Fix authentication bug in login flow",
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
    },
    {
      id: "2",
      type: "comment",
      title: "New comment on issue",
      description: 'Sarah replied to your issue: "I found a workaround..."',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
    },
    {
      id: "3",
      type: "status-change",
      title: "Status updated",
      description: "Database migration moved to In Review",
      timestamp: new Date(Date.now() - 2 * 3600000),
      read: true,
    },
  ])

  const [activityFeed] = useState<ActivityItem[]>([
    {
      id: "1",
      user: "Alex Chen",
      action: "commented on",
      target: "Fix authentication bug",
      timestamp: new Date(Date.now() - 15 * 60000),
      icon: "comment",
    },
    {
      id: "2",
      user: "Sarah Johnson",
      action: "moved",
      target: "Database migration to In Review",
      timestamp: new Date(Date.now() - 45 * 60000),
      icon: "status",
    },
    {
      id: "3",
      user: "You",
      action: "created",
      target: "API rate limiting issue",
      timestamp: new Date(Date.now() - 2 * 3600000),
      icon: "created",
    },
    {
      id: "4",
      user: "Mike Torres",
      action: "assigned to you",
      target: "Update user documentation",
      timestamp: new Date(Date.now() - 5 * 3600000),
      icon: "assigned",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <Users className="w-4 h-4" />
      case "mention":
        return <AlertCircle className="w-4 h-4" />
      case "comment":
        return <Bell className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case "comment":
        return <Bell className="w-4 h-4 text-blue-500" />
      case "status":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "created":
        return <Plus className="w-4 h-4 text-purple-500" />
      case "assigned":
        return <Users className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your project overview.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                  <p className="text-3xl font-bold text-foreground">24</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-50 dark:from-slate-900 dark:to-slate-800 border-green-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-foreground">42</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-purple-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold text-foreground">8</p>
                </div>
                <Users className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-orange-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-foreground">3</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        notification.read
                          ? "bg-background border-border"
                          : "bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-primary">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.timestamp)}</p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned to me</span>
                  <span className="text-lg font-semibold text-foreground">7</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In progress</span>
                  <span className="text-lg font-semibold text-foreground">5</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Waiting for review</span>
                  <span className="text-lg font-semibold text-foreground">3</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="mt-1">{getActivityIcon(item.icon)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{item.user}</span>
                      <span className="text-muted-foreground"> {item.action} </span>
                      <span className="font-medium text-foreground">{item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
