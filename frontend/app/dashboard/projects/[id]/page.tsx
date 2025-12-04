"use client"

import { useState } from "react"
import { ChevronLeft, Filter, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { KanbanBoard, type Issue } from "@/components/kanban-board"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

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
            <h1 className="text-4xl font-bold text-foreground">Mobile App Redesign</h1>
            <p className="text-muted-foreground mt-1">Complete redesign of the iOS and Android apps</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard onIssueClick={setSelectedIssue} />

      {/* Issue Detail Modal */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">{selectedIssue.title}</DialogTitle>
                <DialogDescription>{selectedIssue.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                    <p className="text-foreground mt-2 capitalize">{selectedIssue.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                    <p className="text-foreground mt-2 capitalize">{selectedIssue.priority}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
