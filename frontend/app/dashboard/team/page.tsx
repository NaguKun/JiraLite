"use client"

import { useState } from "react"
import { Plus, Mail, Trash2, Shield, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "member"
  avatar: string
  joinedDate: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "admin",
      avatar: "AJ",
      joinedDate: "Jan 15, 2024",
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah@example.com",
      role: "member",
      avatar: "SC",
      joinedDate: "Feb 20, 2024",
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@example.com",
      role: "member",
      avatar: "MD",
      joinedDate: "Feb 20, 2024",
    },
  ])

  const [inviteEmail, setInviteEmail] = useState("")

  const handleInvite = () => {
    if (!inviteEmail.trim()) return

    const newMember: TeamMember = {
      id: String(members.length + 1),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "member",
      avatar: inviteEmail[0].toUpperCase(),
      joinedDate: "Pending",
    }

    setMembers([...members, newMember])
    setInviteEmail("")
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage your workspace members and permissions</p>
        </div>
        <Dialog>
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
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-input text-foreground border-border"
                  type="email"
                />
              </div>
              <Button onClick={handleInvite} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Members</CardTitle>
          <CardDescription>{members.length} members in this workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === "admin" ? "default" : "outline"}
                      className={
                        member.role === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary border-border text-foreground"
                      }
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{member.joinedDate}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-foreground cursor-pointer">Change Role</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
