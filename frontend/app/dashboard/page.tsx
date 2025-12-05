"use client"

import { Bell, Zap, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePersonalDashboard } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function Dashboard() {
  const { session } = useAuth()
  const { data: dashboard, isLoading, error } = usePersonalDashboard()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const totalAssigned = dashboard?.total_assigned || 0
  const dueTodayCount = dashboard?.due_today?.length || 0
  const dueSoonCount = dashboard?.due_soon?.length || 0
  const teamCount = dashboard?.my_teams?.length || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-orange-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
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
                  <p className="text-sm text-muted-foreground">Assigned to Me</p>
                  <p className="text-3xl font-bold text-foreground">{totalAssigned}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-orange-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-3xl font-bold text-foreground">{dueTodayCount}</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-purple-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                  <p className="text-3xl font-bold text-foreground">{dueSoonCount}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-50 dark:from-slate-900 dark:to-slate-800 border-green-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Teams</p>
                  <p className="text-3xl font-bold text-foreground">{teamCount}</p>
                </div>
                <Users className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Assigned to Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!dashboard?.assigned_issues || dashboard.assigned_issues.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No issues assigned</p>
                ) : (
                  dashboard.assigned_issues.slice(0, 5).map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/dashboard/issues/${issue.id}`}
                      className="block p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{issue.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {issue.status} • <span className={getPriorityColor(issue.priority)}>{issue.priority}</span>
                          </p>
                        </div>
                        {issue.due_date && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(issue.due_date)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!dashboard?.recent_comments || dashboard.recent_comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No recent comments</p>
                ) : (
                  dashboard.recent_comments.slice(0, 5).map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {comment.user?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Teams */}
        {dashboard?.my_teams && dashboard.my_teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.my_teams.map((team) => (
                  <Link
                    key={team.id}
                    href={`/dashboard/team?teamId=${team.id}`}
                    className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{team.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.member_count || 0} members • {team.my_role || "Member"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
