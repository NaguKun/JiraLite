"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"

interface Workspace {
  id: string
  name: string
  avatar?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>({
    id: "1",
    name: "Design Team",
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentWorkspace={currentWorkspace} onWorkspaceSwitch={setCurrentWorkspace} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
