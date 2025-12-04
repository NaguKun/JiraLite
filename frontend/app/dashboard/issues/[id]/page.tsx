"use client"

import { useState } from "react"
import { IssueDetailPanel, type Issue, type Comment } from "@/components/issue-detail-panel"
import { AIPanel } from "@/components/ai-panel"

const SAMPLE_ISSUE: Issue = {
  id: "JIRA-123",
  title: "Fix login page responsive design",
  description:
    "The login page is not responsive on mobile devices. On screens smaller than 640px, the form gets cut off and the submit button is not clickable. We need to:\n\n1. Adjust the form width and padding\n2. Stack form fields vertically on mobile\n3. Test on various device sizes\n4. Ensure touch targets are at least 44x44px",
  status: "in_progress",
  priority: "high",
  assignee: { id: "1", name: "Sarah Chen", avatar: "SC" },
  reporter: { id: "2", name: "Alex Johnson", avatar: "AJ" },
  dueDate: "2024-12-08",
  createdAt: "Dec 1, 2024",
  updatedAt: "Dec 5, 2024",
}

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "1",
    author: { name: "Mike Davis", avatar: "MD" },
    content:
      "I can confirm this issue on iPhone 12. The form appears to overflow the viewport. Should we consider using a mobile-first approach?",
    createdAt: "Dec 2, 2024",
  },
  {
    id: "2",
    author: { name: "Sarah Chen", avatar: "SC" },
    content:
      "Good catch! I've started working on this. I'm currently refactoring the login form component to use CSS Grid for better responsiveness. I'll have a PR ready by tomorrow.",
    createdAt: "Dec 3, 2024",
    isEdited: true,
  },
  {
    id: "3",
    author: { name: "Alex Johnson", avatar: "AJ" },
    content: "That sounds great! Let's make sure to test on landscape mode too.",
    createdAt: "Dec 4, 2024",
  },
]

export default function IssuePage({ params }: { params: { id: string } }) {
  const [issue, setIssue] = useState<Issue>(SAMPLE_ISSUE)
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS)

  const handleStatusChange = (newStatus: Issue["status"]) => {
    setIssue({ ...issue, status: newStatus })
  }

  const handlePriorityChange = (newPriority: Issue["priority"]) => {
    setIssue({ ...issue, priority: newPriority })
  }

  const handleCommentAdd = (content: string) => {
    const newComment: Comment = {
      id: String(comments.length + 1),
      author: { name: "You", avatar: "YO" },
      content,
      createdAt: "Just now",
    }
    setComments([...comments, newComment])
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Issue Panel */}
        <div className="lg:col-span-3">
          <IssueDetailPanel
            issue={issue}
            comments={comments}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onCommentAdd={handleCommentAdd}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <AIPanel
              issueId={issue.id}
              issueTitle={issue.title}
              issueDescription={issue.description}
              currentLabels={[]}
              onLabelsGenerated={(labels) => {
                console.log("Labels generated:", labels)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
