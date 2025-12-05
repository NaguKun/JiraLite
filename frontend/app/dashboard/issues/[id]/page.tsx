"use client"

import { useState } from "react"
import { ChevronLeft, User, Calendar, Flag, Send, Trash2, Edit2, AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIssue, useComments, useCreateComment, useUpdateIssue, useGenerateSummary, useGenerateSuggestion } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const PRIORITY_COLORS = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-red-500",
}

const STATUS_OPTIONS = ["Backlog", "In Progress", "Done"]

export default function IssuePage({ params }: { params: { id: string } }) {
  const { session, user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")

  // Fetch issue
  const { data: issue, isLoading: issueLoading, error: issueError, refetch: refetchIssue } = useIssue(params.id)

  // Fetch comments
  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useComments(params.id, 50, 0)

  // Create comment mutation
  const { mutate: createComment, isLoading: isCreatingComment } = useCreateComment(params.id)

  // Update issue mutation
  const { mutate: updateIssue } = useUpdateIssue(params.id)

  // AI mutations
  const { mutate: generateSummary, isLoading: isGeneratingSummary } = useGenerateSummary(params.id)
  const { mutate: generateSuggestion, isLoading: isGeneratingSuggestion } = useGenerateSuggestion(params.id)

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    try {
      await createComment({ content: newComment })
      toast.success("Comment added!")
      setNewComment("")
      refetchComments()
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateIssue({ status: newStatus })
      toast.success("Status updated")
      refetchIssue()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateIssue({ priority: newPriority as "LOW" | "MEDIUM" | "HIGH" })
      toast.success("Priority updated")
      refetchIssue()
    } catch (error) {
      console.error("Failed to update priority:", error)
      toast.error("Failed to update priority")
    }
  }

  const handleSaveDescription = async () => {
    try {
      await updateIssue({ description: editedDescription })
      toast.success("Description updated")
      setIsEditingDescription(false)
      refetchIssue()
    } catch (error) {
      console.error("Failed to update description:", error)
      toast.error("Failed to update description")
    }
  }

  const handleGenerateSummary = async () => {
    try {
      await generateSummary(undefined)
      toast.success("AI summary generated!")
      refetchIssue()
    } catch (error) {
      console.error("Failed to generate summary:", error)
    }
  }

  const handleGenerateSuggestion = async () => {
    try {
      await generateSuggestion(undefined)
      toast.success("AI suggestion generated!")
      refetchIssue()
    } catch (error) {
      console.error("Failed to generate suggestion:", error)
    }
  }

  if (issueLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issue...</p>
        </div>
      </div>
    )
  }

  if (issueError || !issue) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold">Failed to load issue</p>
          <p className="text-muted-foreground text-sm mt-2">{issueError?.message}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href={`/dashboard/projects/${issue.project_id}`}>
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to project
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      className={`${PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS]} text-white`}
                    >
                      {issue.priority}
                    </Badge>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground">{issue.title}</h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Created {formatDate(issue.created_at)}</span>
                    <span>•</span>
                    <span>Updated {formatDate(issue.updated_at)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground font-semibold">Description</Label>
                    {!isEditingDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditedDescription(issue.description || "")
                          setIsEditingDescription(true)
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="min-h-32"
                        placeholder="Add a description..."
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveDescription} size="sm">
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">
                        {issue.description || "No description provided."}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Insights */}
                {(issue.ai_summary || issue.ai_suggestion) && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI Insights
                    </h3>
                    {issue.ai_summary && (
                      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Summary</p>
                        <p className="text-sm text-purple-800 dark:text-purple-200">{issue.ai_summary}</p>
                      </div>
                    )}
                    {issue.ai_suggestion && (
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Suggestion</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{issue.ai_suggestion}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Comments ({comments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-xs font-semibold">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={isCreatingComment || !newComment.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {isCreatingComment ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 border-t pt-4">
                  {commentsLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading comments...</p>
                  ) : !comments || comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                          <AvatarFallback className="text-xs font-semibold">
                            {comment.user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-secondary rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-foreground text-sm">
                                {comment.user?.name || "Unknown User"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
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
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={issue.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select value={issue.priority} onValueChange={handlePriorityChange}>
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

                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Assignee</Label>
                  {issue.assignee ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-secondary">
                      <Avatar className="w-6 h-6 bg-primary text-primary-foreground">
                        <AvatarFallback className="text-xs">
                          {issue.assignee.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  )}
                </div>

                {/* Reporter */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reporter</Label>
                  {issue.owner ? (
                    <div className="flex items-center gap-2 p-2 rounded bg-secondary">
                      <Avatar className="w-6 h-6 bg-primary text-primary-foreground">
                        <AvatarFallback className="text-xs">
                          {issue.owner.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{issue.owner.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unknown</p>
                  )}
                </div>

                {/* Due Date */}
                {issue.due_date && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(issue.due_date)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? "Generating..." : "Generate Summary"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleGenerateSuggestion}
                  disabled={isGeneratingSuggestion}
                >
                  {isGeneratingSuggestion ? "Generating..." : "Get Suggestion"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
