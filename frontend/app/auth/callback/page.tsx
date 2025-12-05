"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          toast.error("Authentication failed")
          router.push("/login")
          return
        }

        if (data.session) {
          toast.success("Successfully logged in!")
          router.push("/dashboard")
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Callback error:", error)
        toast.error("Something went wrong")
        router.push("/login")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
