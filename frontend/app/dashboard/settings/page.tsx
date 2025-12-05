"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Settings, User, Bell, Lock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api-client"

export default function SettingsPage() {
  const router = useRouter()
  const { user, session, logout, refreshUser } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    profile_image: "",
  })

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Delete account state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.access_token) return

      try {
        const profile = await api.users.getMyProfile(session.access_token)
        setFormData({
          name: profile.name || "",
          profile_image: profile.profile_image || "",
        })
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [session])

  const handleSaveProfile = async () => {
    if (!session?.access_token) {
      toast.error("Not authenticated")
      return
    }

    setIsSaving(true)

    try {
      await api.users.updateMyProfile(
        {
          name: formData.name,
          profile_image: formData.profile_image || undefined,
        },
        session.access_token
      )
      await refreshUser()
      toast.success("Profile updated successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!session?.access_token) {
      toast.error("Not authenticated")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)

    try {
      await api.auth.changePassword(
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        },
        session.access_token
      )
      toast.success("Password changed successfully")
      setIsPasswordDialogOpen(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password"
      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!session?.access_token) {
      toast.error("Not authenticated")
      return
    }

    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm')
      return
    }

    setIsDeleting(true)

    try {
      await api.users.deleteMyAccount(session.access_token)
      toast.success("Account deleted successfully")
      await logout()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete account"
      toast.error(message)
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input text-foreground border-border"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-input text-foreground border-border opacity-60"
                title="Email cannot be changed"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage" className="text-foreground">
                Profile Image URL
              </Label>
              <Input
                id="profileImage"
                value={formData.profile_image}
                onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                className="bg-input text-foreground border-border"
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">Enter a URL to your profile image</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start border-border text-foreground bg-transparent">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPasswordDialogOpen(false)
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      isChangingPassword ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full justify-start border-border text-foreground bg-transparent opacity-50 cursor-not-allowed"
              disabled
            >
              <Bell className="w-4 h-4 mr-2" />
              Two-Factor Authentication (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Delete Account Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                      Warning: You must delete or transfer ownership of all your teams before deleting your
                      account.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm">
                      Type <strong>DELETE</strong> to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false)
                      setDeleteConfirmText("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
