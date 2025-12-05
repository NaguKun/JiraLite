"use client"

import { useState, useEffect } from "react"
import { Plus, Mail, Trash2, Shield, MoreVertical, Users as UsersIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTeams, useTeamMembers, useInviteMember } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api-client"

export default function TeamPage() {
  const { session } = useAuth()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"OWNER" | "ADMIN" | "MEMBER">("MEMBER")
  const [newTeamData, setNewTeamData] = useState({ name: "" })
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)

  // Fetch teams
  const { data: teams, isLoading: teamsLoading, error: teamsError, refetch: refetchTeams } = useTeams()

  // Auto-select first team
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams, selectedTeamId])

  // Fetch team members
  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useTeamMembers(selectedTeamId)

  // Invite member mutation
  const { mutate: inviteMember, isLoading: isInviting } = useInviteMember(selectedTeamId || "")

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required")
      return
    }

    if (!selectedTeamId) {
      toast.error("Please select a team first")
      return
    }

    try {
      await inviteMember({
        invitee_email: inviteEmail,
        role: inviteRole,
      })
      toast.success("Invitation sent successfully!")
      setInviteEmail("")
      setInviteRole("MEMBER")
      setIsInviteDialogOpen(false)
    } catch (error) {
      console.error("Failed to invite member:", error)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamData.name.trim()) {
      toast.error("Team name is required")
      return
    }

    if (!session?.access_token) {
      toast.error("Not authenticated")
      return
    }

    setIsCreatingTeam(true)

    try {
      await api.teams.createTeam({ name: newTeamData.name }, session.access_token)
      toast.success("Team created successfully!")
      setNewTeamData({ name: "" })
      setIsCreateTeamDialogOpen(false)
      refetchTeams()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create team"
      toast.error(message)
    } finally {
      setIsCreatingTeam(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeamId || !session?.access_token) return

    try {
      await api.teams.kickMember(selectedTeamId, userId, session.access_token)
      toast.success("Member removed successfully")
      refetchMembers()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove member"
      toast.error(message)
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
          <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Teams Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first team to start collaborating with others.</p>
          <Button
            onClick={() => setIsCreateTeamDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage your workspace members and permissions</p>
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

          <Button
            onClick={() => setIsCreateTeamDialogOpen(true)}
            variant="outline"
            className="border-border text-foreground bg-transparent gap-2"
          >
            <Plus className="w-4 h-4" />
            New Team
          </Button>

          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-foreground">Invite Team Member</DialogTitle>
                <DialogDescription>Add a new member to your team by email</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="inviteEmail"
                    placeholder="member@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-input text-foreground border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole" className="text-foreground">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Members List */}
      {membersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        </div>
      ) : membersError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-foreground font-semibold">Failed to load team members</p>
            <p className="text-muted-foreground text-sm mt-2">{membersError.message}</p>
          </div>
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Active Members</CardTitle>
            <CardDescription>{members?.length || 0} members in this team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!members || members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No team members yet</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {member.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{member.user?.name || "Unknown User"}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {member.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={member.role === "OWNER" ? "default" : "outline"}
                          className={
                            member.role === "OWNER"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary border-border text-foreground"
                          }
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {member.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(member.joined_at)}
                        </span>
                      </div>
                      {member.role !== "OWNER" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Team</DialogTitle>
            <DialogDescription>Start a new team to collaborate with others</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-foreground">
                Team Name
              </Label>
              <Input
                id="teamName"
                placeholder="My Awesome Team"
                value={newTeamData.name}
                onChange={(e) => setNewTeamData({ name: e.target.value })}
                className="bg-input text-foreground border-border"
              />
            </div>
            <Button
              onClick={handleCreateTeam}
              disabled={isCreatingTeam || !newTeamData.name.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreatingTeam ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
