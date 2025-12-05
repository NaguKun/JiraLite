"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast.error("Invalid or missing reset token")
      router.push("/forgot-password")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (!token) {
      toast.error("Invalid reset token")
      return
    }

    setIsLoading(true)

    try {
      await api.auth.confirmPasswordReset(token, newPassword)
      setIsSuccess(true)
      toast.success("Password reset successful!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reset password"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Jira Lite</span>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="space-y-2">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-foreground text-center">Password reset!</CardTitle>
              <CardDescription className="text-center">
                Your password has been successfully reset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Continue to login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">Jira Lite</span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-foreground">Reset your password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-input text-foreground placeholder:text-muted-foreground border-border"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input text-foreground placeholder:text-muted-foreground border-border"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
