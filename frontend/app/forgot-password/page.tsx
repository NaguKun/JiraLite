"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.auth.requestPasswordReset({ email })
      setEmailSent(true)
      toast.success("Password reset email sent! Check your inbox.")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
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
              <CardTitle className="text-2xl text-foreground">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>

              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-border text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline font-semibold"
                >
                  Try again
                </button>
              </p>
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
            <CardTitle className="text-2xl text-foreground">Forgot password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input text-foreground placeholder:text-muted-foreground border-border"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="pt-4">
              <Link href="/login">
                <Button variant="ghost" className="w-full text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
