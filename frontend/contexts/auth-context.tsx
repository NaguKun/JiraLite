"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { User, Session } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  auth_provider: string
  created_at: string
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [])

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSession(session)
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setSession(session)

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser(profile)
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!session?.user) return

    const profile = await fetchUserProfile(session.user.id)
    if (profile) {
      setUser(profile)
    }
  }, [session, fetchUserProfile])

  // Login with email/password
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Signup with email/password
  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            provider: 'email'
          }
        }
      })

      if (error) throw error

      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed"
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed"
      toast.error(message)
      throw error
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      toast.info("You've been logged out")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed")
    }
  }, [router])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login")
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
