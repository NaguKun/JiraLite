"use client"

import { useState, useEffect } from "react"
import { Plus, MoreVertical, Users, Archive, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTeams, useProjects, useCreateProject } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function ProjectsPage() {
  const { session } = useAuth()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectData, setNewProjectData] = useState({
    name: "",
    description: "",
  })

  // Fetch teams
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams()

  // Auto-select first team
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams, selectedTeamId])

  // Fetch projects for selected team
  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch } = useProjects(selectedTeamId)

  // Create project mutation
  const { mutate: createProject, isLoading: isCreating } = useCreateProject(selectedTeamId || "")

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) {
      toast.error("Project name is required")
      return
    }

    if (!selectedTeamId) {
      toast.error("Please select a team first")
      return
    }

    try {
      await createProject({
        name: newProjectData.name,
        description: newProjectData.description || undefined,
      })
      toast.success("Project created successfully!")
      setNewProjectData({ name: "", description: "" })
      setIsCreateDialogOpen(false)
      refetch()
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  if (teamsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  if (teamsError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-semibold">Failed to load teams</p>
          <p className="text-muted-foreground text-sm mt-2">{teamsError.message}</p>
        </div>
      </div>
    )
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Teams Yet</h2>
          <p className="text-muted-foreground mb-6">
            You need to create or join a team before you can create projects.
          </p>
          <Link href="/dashboard/team">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Go to Team Management
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const colorClasses = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage and organize your team projects</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Team Selector */}
          <Select value={selectedTeamId || ""} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                  <Label htmlFor="projectName" className="text-foreground">
                    Project Name
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="My Awesome Project"
                    value={newProjectData.name}
                    onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                    className="bg-input text-foreground border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDesc" className="text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="projectDesc"
                    placeholder="What's this project about?"
                    value={newProjectData.description}
                    onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                    className="bg-input text-foreground border-border"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreating || !newProjectData.name.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      ) : projectsError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-foreground font-semibold">Failed to load projects</p>
            <p className="text-muted-foreground text-sm mt-2">{projectsError.message}</p>
          </div>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <Archive className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to start organizing your team's work
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="bg-card border-border hover:border-primary/50 transition-colors overflow-hidden group cursor-pointer h-full">
                <div className={`h-1 bg-gradient-to-r ${colorClasses[index % colorClasses.length]}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-foreground truncate">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {project.description || "No description"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>{project.issue_count || 0} issues</span>
                    </div>
                    <Badge variant={project.is_archived ? "secondary" : "outline"} className="bg-secondary border-border text-foreground">
                      {project.is_archived ? "Archived" : "Active"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
