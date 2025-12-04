"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, Settings, Users, FolderOpen, Bell, LogOut, Plus, ChevronDown, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Workspace {
  id: string
  name: string
  avatar?: string
}

interface SidebarProps {
  currentWorkspace: Workspace
  onWorkspaceSwitch?: (workspace: Workspace) => void
}

export function Sidebar({ currentWorkspace, onWorkspaceSwitch }: SidebarProps) {
  const [showWorkspaces, setShowWorkspaces] = useState(false)
  const pathname = usePathname()

  const workspaces: Workspace[] = [
    { id: "1", name: "Design Team" },
    { id: "2", name: "Engineering" },
    { id: "3", name: "Product" },
  ]

  const notifications = 3 // Example notifications count

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">Jira Lite</span>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 py-3 border-b border-border">
        <DropdownMenu open={showWorkspaces} onOpenChange={setShowWorkspaces}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-secondary/50 border-border text-foreground hover:bg-secondary"
            >
              <span className="truncate text-sm font-medium">{currentWorkspace.name}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => onWorkspaceSwitch?.(ws)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 bg-primary rounded-md"></div>
                <span className="text-foreground">{ws.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="text-primary cursor-pointer gap-2">
              <Plus className="w-4 h-4" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" isActive={pathname === "/dashboard"} />
        <NavItem
          icon={FolderOpen}
          label="Projects"
          href="/dashboard/projects"
          isActive={pathname.includes("/dashboard/projects")}
        />
        <NavItem icon={Users} label="Team" href="/dashboard/team" isActive={pathname.includes("/dashboard/team")} />
        <NavItem
          icon={Bell}
          label="Notifications"
          href="/dashboard/notifications"
          isActive={pathname.includes("/dashboard/notifications")}
          badge={notifications ? String(notifications) : undefined}
        />
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-4 space-y-2 border-t border-border">
        <Link href="/dashboard/settings">
          <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary gap-2" size="sm">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </Link>
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-secondary gap-2" size="sm">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  badge?: string
  isActive?: boolean
}

function NavItem({ icon: Icon, label, href, badge, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start gap-2 text-sm font-medium ${
          isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
        }`}
        size="sm"
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs bg-primary text-primary-foreground rounded-full">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  )
}
