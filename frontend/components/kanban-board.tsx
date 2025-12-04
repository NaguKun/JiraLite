"use client"

import type React from "react"

import { useState } from "react"
import { Plus, GripVertical, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface Issue {
  id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assignee?: { name: string; avatar: string }
  dueDate?: string
}

interface KanbanBoardProps {
  issues?: Issue[]
  onIssueClick?: (issue: Issue) => void
}

const STATUS_COLUMNS = {
  todo: { label: "To Do", color: "bg-slate-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  review: { label: "In Review", color: "bg-purple-500" },
  done: { label: "Done", color: "bg-green-500" },
}

const PRIORITY_COLORS = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
}

export function KanbanBoard({ issues = DEFAULT_ISSUES, onIssueClick }: KanbanBoardProps) {
  const [boardIssues, setBoardIssues] = useState<Issue[]>(issues)
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)
  const [newIssueStates, setNewIssueStates] = useState<Record<string, boolean>>({})
  const [newIssueTitles, setNewIssueTitles] = useState<Record<string, string>>({})

  const handleDragStart = (issue: Issue) => {
    setDraggedIssue(issue)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Issue["status"]) => {
    if (!draggedIssue) return

    setBoardIssues(boardIssues.map((issue) => (issue.id === draggedIssue.id ? { ...issue, status } : issue)))
    setDraggedIssue(null)
  }

  const handleAddIssue = (status: Issue["status"]) => {
    const title = newIssueTitles[status]
    if (!title.trim()) return

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title,
      description: "",
      status,
      priority: "medium",
    }

    setBoardIssues([...boardIssues, newIssue])
    setNewIssueTitles({ ...newIssueTitles, [status]: "" })
    setNewIssueStates({ ...newIssueStates, [status]: false })
  }

  const handleDeleteIssue = (id: string) => {
    setBoardIssues(boardIssues.filter((issue) => issue.id !== id))
  }

  const columnStatuses: Issue["status"][] = ["todo", "in_progress", "review", "done"]

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columnStatuses.map((status) => {
        const columnIssues = boardIssues.filter((issue) => issue.status === status)
        const columnConfig = STATUS_COLUMNS[status]

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
            <div
              className="flex-1 px-4 py-4 space-y-3 overflow-y-auto min-h-96"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              {columnIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onDragStart={() => handleDragStart(issue)}
                  onDelete={() => handleDeleteIssue(issue.id)}
                  onClick={() => onIssueClick?.(issue)}
                />
              ))}

              {/* Add Issue Button */}
              {!newIssueStates[status] ? (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary gap-2 justify-start"
                  size="sm"
                  onClick={() => setNewIssueStates({ ...newIssueStates, [status]: true })}
                >
                  <Plus className="w-4 h-4" />
                  Add issue
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Issue title..."
                    value={newIssueTitles[status] || ""}
                    onChange={(e) => setNewIssueTitles({ ...newIssueTitles, [status]: e.target.value })}
                    className="bg-card text-foreground border-border text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                      onClick={() => handleAddIssue(status)}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-secondary text-xs bg-transparent"
                      onClick={() => setNewIssueStates({ ...newIssueStates, [status]: false })}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface IssueCardProps {
  issue: Issue
  onDragStart: () => void
  onDelete: () => void
  onClick: () => void
}

function IssueCard({ issue, onDragStart, onDelete, onClick }: IssueCardProps) {
  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-card border-border cursor-move hover:border-primary/50 transition-colors group"
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100" />
          <p className="font-medium text-foreground text-sm flex-1 leading-snug">{issue.title}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-foreground cursor-pointer">Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete()} className="text-destructive cursor-pointer">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-xs font-medium border ${PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS]}`}
          >
            {issue.priority}
          </Badge>
          {issue.dueDate && <span className="text-xs text-muted-foreground">{issue.dueDate}</span>}
        </div>

        {issue.assignee && (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 bg-primary text-primary-foreground">
              <AvatarFallback className="text-xs font-semibold">{issue.assignee.avatar}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{issue.assignee.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const DEFAULT_ISSUES: Issue[] = [
  {
    id: "issue-1",
    title: "Fix login page responsive design",
    description: "Mobile layout is broken on small screens",
    status: "todo",
    priority: "high",
    dueDate: "Dec 8",
  },
  {
    id: "issue-2",
    title: "Add dark mode support",
    description: "Implement theme toggle across app",
    status: "in_progress",
    priority: "medium",
    assignee: { name: "Sarah Chen", avatar: "SC" },
    dueDate: "Dec 10",
  },
  {
    id: "issue-3",
    title: "Integrate Stripe payments",
    description: "Add payment processing for subscriptions",
    status: "in_progress",
    priority: "high",
    assignee: { name: "Mike Davis", avatar: "MD" },
    dueDate: "Dec 12",
  },
  {
    id: "issue-4",
    title: "Create API documentation",
    description: "Document all endpoints and parameters",
    status: "review",
    priority: "low",
    dueDate: "Dec 15",
  },
  {
    id: "issue-5",
    title: "Setup analytics tracking",
    description: "Add event tracking for user actions",
    status: "done",
    priority: "medium",
    assignee: { name: "Alex Johnson", avatar: "AJ" },
  },
]
