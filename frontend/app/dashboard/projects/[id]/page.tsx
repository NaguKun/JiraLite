"use client"

import { useState } from "react"
import { ChevronLeft, Filter, Settings, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProject, useIssues, useCreateIssue, useUpdateIssueStatus, useTeamMembers } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GripVertical } from "lucide-react"

const STATUS_COLUMNS = {
  Backlog: { label: "Backlog", color: "bg-slate-500" },
  "In Progress": { label: "In Progress", color: "bg-blue-500" },
  Done: { label: "Done", color: "bg-green-500" },
}

const PRIORITY_COLORS = {
  LOW: "bg-blue-500/10 text-blue-600 border-blue-200",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  HIGH: "bg-red-500/10 text-red-600 border-red-200",
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { session } = useAuth()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newIssueData, setNewIssueData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "HIGH" | "MEDIUM" | "LOW",
    assignee_user_id: "",
  })

  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(params.id)

  // Fetch issues
  const { data: issues, isLoading: issuesLoading, error: issuesError, refetch } = useIssues(params.id)

  // Fetch team members for assignment
  const { data: teamMembers } = useTeamMembers(project?.team_id || null)

  // Create issue mutation
  const { mutate: createIssue, isLoading: isCreating } = useCreateIssue(params.id)

  // Update issue status mutation
  const { mutate: updateIssueStatus } = useUpdateIssueStatus("")

  const handleCreateIssue = async () => {
    if (!newIssueData.title.trim()) {
      toast.error("Issue title is required")
      return
    }

    try {
      await createIssue({
        title: newIssueData.title,
        description: newIssueData.description || undefined,
        priority: newIssueData.priority,
        assignee_user_id: newIssueData.assignee_user_id || undefined,
        labels: [],
      })
      toast.success("Issue created successfully!")
      setNewIssueData({ title: "", description: "", priority: "MEDIUM", assignee_user_id: "" })
      setIsCreateDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Failed to create issue:", error)
    }
  }

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await updateIssueStatus({ status: newStatus })
      toast.success("Issue status updated")
      refetch()
    } catch (error) {
      console.error("Failed to update issue status:", error)
      toast.error("Failed to update issue status")
    }
  }

  if (projectLoading || issuesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (projectError || issuesError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold">Failed to load project</p>
          <p className="text-muted-foreground text-sm mt-2">
            {projectError?.message || issuesError?.message}
          </p>
        </div>
      </div>
    )
  }

  const columnStatuses = ["Backlog", "In Progress", "Done"]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{project?.name || "Project"}</h1>
            <p className="text-muted-foreground mt-1">{project?.description || "No description"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columnStatuses.map((status) => {
          const columnIssues = issues?.filter((issue) => issue.status === status) || []
          const columnConfig = STATUS_COLUMNS[status as keyof typeof STATUS_COLUMNS]

          return (
            <div
              key={status}
              className="flex-shrink-0 w-80 flex flex-col bg-secondary/30 rounded-lg border border-border"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${columnConfig.color}`}></div>
                  <h3 className="font-semibold text-foreground">{columnConfig.label}</h3>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary rounded-full px-2 py-1">
                    {columnIssues.length}
                  </span>
                </div>
              </div>

              {/* Issues Container */}
              <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto min-h-96">
                {columnIssues.map((issue) => (
                  <Link key={issue.id} href={`/dashboard/issues/${issue.id}`}>
                    <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                          <p className="font-medium text-foreground text-sm flex-1 leading-snug">
                            {issue.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${
                              PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS]
                            }`}
                          >
                            {issue.priority}
                          </Badge>
                          {issue.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(issue.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        {issue.assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 bg-primary text-primary-foreground">
                              <AvatarFallback className="text-xs font-semibold">
                                {issue.assignee.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{issue.assignee.name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Issue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Issue</DialogTitle>
            <DialogDescription>Add a new issue to this project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle" className="text-foreground">
                Title
              </Label>
              <Input
                id="issueTitle"
                placeholder="Issue title"
                value={newIssueData.title}
                onChange={(e) => setNewIssueData({ ...newIssueData, title: e.target.value })}
                className="bg-input text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDescription" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="issueDescription"
                placeholder="Describe the issue..."
                value={newIssueData.description}
                onChange={(e) => setNewIssueData({ ...newIssueData, description: e.target.value })}
                className="bg-input text-foreground border-border"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuePriority" className="text-foreground">
                  Priority
                </Label>
                <Select
                  value={newIssueData.priority}
                  onValueChange={(value: "HIGH" | "MEDIUM" | "LOW") =>
                    setNewIssueData({ ...newIssueData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueAssignee" className="text-foreground">
                  Assignee
                </Label>
                <Select
                  value={newIssueData.assignee_user_id}
                  onValueChange={(value) => setNewIssueData({ ...newIssueData, assignee_user_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers?.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.user?.name || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCreateIssue}
              disabled={isCreating || !newIssueData.title.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
