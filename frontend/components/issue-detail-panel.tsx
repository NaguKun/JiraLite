"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, Send, Edit2, MoreVertical, Clock, User, Flag } from "lucide-react"

export interface Issue {
  id: string
  title: string
  description: string
  status: "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assignee?: { id: string; name: string; avatar: string }
  reporter?: { id: string; name: string; avatar: string }
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  author: { name: string; avatar: string }
  content: string
  createdAt: string
  isEdited?: boolean
}

interface IssueDetailPanelProps {
  issue: Issue
  comments: Comment[]
  onBack?: () => void
  onStatusChange?: (status: Issue["status"]) => void
  onPriorityChange?: (priority: Issue["priority"]) => void
  onCommentAdd?: (comment: string) => void
}

const STATUS_COLORS = {
  todo: "bg-slate-500/10 text-slate-600 border-slate-200",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-200",
  review: "bg-purple-500/10 text-purple-600 border-purple-200",
  done: "bg-green-500/10 text-green-600 border-green-200",
}

const PRIORITY_COLORS = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
}

export function IssueDetailPanel({
  issue,
  comments,
  onBack,
  onStatusChange,
  onPriorityChange,
  onCommentAdd,
}: IssueDetailPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return
    onCommentAdd?.(newComment)
    setNewComment("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{issue.title}</h1>
          <p className="text-muted-foreground">#{issue.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-foreground">Description</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingDescription(!isEditingDescription)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    defaultValue={issue.description}
                    className="bg-input text-foreground border-border min-h-32"
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => setIsEditingDescription(false)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground hover:bg-secondary bg-transparent"
                      onClick={() => setIsEditingDescription(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground whitespace-pre-wrap">{issue.description || "No description provided"}</p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-xs font-semibold">You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-input text-foreground border-border min-h-20 text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-secondary bg-transparent"
                        onClick={() => setNewComment("")}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-3 h-3" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mt-6 border-t border-border pt-4">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No comments yet. Start the conversation!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        <AvatarFallback className="text-xs font-semibold">{comment.author.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{comment.author.name}</p>
                          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                          {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
                        </div>
                        <p className="text-foreground text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                          >
                            Reply
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-foreground cursor-pointer text-sm">
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive cursor-pointer text-sm">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue={issue.status} onValueChange={(value) => onStatusChange?.(value as Issue["status"])}>
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="todo" className="text-foreground">
                    To Do
                  </SelectItem>
                  <SelectItem value="in_progress" className="text-foreground">
                    In Progress
                  </SelectItem>
                  <SelectItem value="review" className="text-foreground">
                    In Review
                  </SelectItem>
                  <SelectItem value="done" className="text-foreground">
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                defaultValue={issue.priority}
                onValueChange={(value) => onPriorityChange?.(value as Issue["priority"])}
              >
                <SelectTrigger className="bg-input text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="low" className="text-foreground">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-foreground">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-foreground">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignee
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issue.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-xs font-semibold">{issue.assignee.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{issue.assignee.name}</p>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-sm bg-transparent"
                >
                  Assign to you
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Due Date */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                defaultValue={issue.dueDate}
                className="bg-input text-foreground border-border text-sm"
              />
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Created</p>
                <p className="text-foreground">{issue.createdAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Updated</p>
                <p className="text-foreground">{issue.updatedAt}</p>
              </div>
              {issue.reporter && (
                <div>
                  <p className="text-muted-foreground text-xs">Reporter</p>
                  <p className="text-foreground">{issue.reporter.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
