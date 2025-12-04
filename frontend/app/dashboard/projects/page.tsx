"use client"

import { useState } from "react"
import { Plus, MoreVertical, Users, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "archived"
  members: number
  color: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Mobile App Redesign",
      description: "Complete redesign of the iOS and Android apps",
      status: "active",
      members: 5,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "2",
      name: "API Integration",
      description: "Integrate third-party payment systems",
      status: "active",
      members: 3,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "3",
      name: "Marketing Website",
      description: "New landing page and documentation",
      status: "active",
      members: 4,
      color: "from-green-500 to-emerald-500",
    },
  ])

  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: String(projects.length + 1),
      name: newProjectName,
      description: newProjectDesc,
      status: "active",
      members: 1,
      color: `from-${["blue", "purple", "green"][Math.floor(Math.random() * 3)]}-500 to-${["cyan", "pink", "emerald"][Math.floor(Math.random() * 3)]}-500`,
    }

    setProjects([...projects, newProject])
    setNewProjectName("")
    setNewProjectDesc("")
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your team projects</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Project</DialogTitle>
              <DialogDescription>Start a new project to organize your team's work</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Name</label>
                <Input
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-input text-foreground border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  placeholder="What's this project about?"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="bg-input text-foreground border-border"
                />
              </div>
              <Button
                onClick={handleCreateProject}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-card border-border hover:border-primary/50 transition-colors overflow-hidden group cursor-pointer"
          >
            <div className={`h-1 bg-gradient-to-r ${project.color}`}></div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-foreground truncate">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-foreground cursor-pointer">Edit Project</DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground cursor-pointer">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{project.members} members</span>
                </div>
                <Badge variant="outline" className="bg-secondary border-border text-foreground">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
