// Custom hooks for data fetching
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api-client"
import type * as API from "@/types/api"

interface UseAPIOptions {
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

// Generic hook for fetching data
export function useQuery<T>(
  queryFn: (token: string) => Promise<T>,
  options: UseAPIOptions = {}
) {
  const { session } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { enabled = true, onSuccess, onError } = options

  const refetch = useCallback(async () => {
    const token = session?.access_token
    if (!token || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryFn(token)
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [session, enabled, queryFn, onSuccess, onError])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables, token: string) => Promise<TData>,
  options: UseAPIOptions = {}
) {
  const { session } = useAuth()
  const [data, setData] = useState<TData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { onSuccess, onError } = options

  const mutate = useCallback(
    async (variables: TVariables) => {
      const token = session?.access_token
      if (!token) {
        throw new Error("Not authenticated")
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await mutationFn(variables, token)
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("An error occurred")
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [session, mutationFn, onSuccess, onError]
  )

  return { mutate, data, isLoading, error }
}

// ==================== Team Hooks ====================

export function useTeams() {
  return useQuery((token) => api.teams.getMyTeams(token))
}

export function useTeam(teamId: string | null) {
  return useQuery((token) => api.teams.getTeam(teamId!, token), {
    enabled: !!teamId,
  })
}

export function useTeamMembers(teamId: string | null) {
  return useQuery((token) => api.teams.getTeamMembers(teamId!, token), {
    enabled: !!teamId,
  })
}

export function useCreateTeam() {
  return useMutation((data: API.TeamCreate, token) => api.teams.createTeam(data, token))
}

export function useInviteMember(teamId: string) {
  return useMutation((data: API.TeamInvite, token) => api.teams.inviteMember(teamId, data, token))
}

// ==================== Project Hooks ====================

export function useProjects(teamId: string | null) {
  return useQuery((token) => api.projects.getTeamProjects(teamId!, token), {
    enabled: !!teamId,
  })
}

export function useProject(projectId: string | null) {
  return useQuery((token) => api.projects.getProject(projectId!, token), {
    enabled: !!projectId,
  })
}

export function useCreateProject(teamId: string) {
  return useMutation((data: API.ProjectCreate, token) => api.projects.createProject(teamId, data, token))
}

export function useLabels(projectId: string | null) {
  return useQuery((token) => api.projects.getLabels(projectId!, token), {
    enabled: !!projectId,
  })
}

export function useCreateLabel(projectId: string) {
  return useMutation((data: API.LabelCreate, token) => api.projects.createLabel(projectId, data, token))
}

// ==================== Issue Hooks ====================

export function useIssues(projectId: string | null, status?: string) {
  return useQuery((token) => api.issues.getProjectIssues(projectId!, status, token), {
    enabled: !!projectId,
  })
}

export function useIssue(issueId: string | null) {
  return useQuery((token) => api.issues.getIssue(issueId!, token), {
    enabled: !!issueId,
  })
}

export function useCreateIssue(projectId: string) {
  return useMutation((data: API.IssueCreate, token) => api.issues.createIssue(projectId, data, token))
}

export function useUpdateIssue(issueId: string) {
  return useMutation((data: API.IssueUpdate, token) => api.issues.updateIssue(issueId, data, token))
}

export function useUpdateIssueStatus(issueId: string) {
  return useMutation((data: API.IssueStatusUpdate, token) =>
    api.issues.updateIssueStatus(issueId, data, token)
  )
}

export function useSubtasks(issueId: string | null) {
  return useQuery((token) => api.issues.getSubtasks(issueId!, token), {
    enabled: !!issueId,
  })
}

export function useCreateSubtask(issueId: string) {
  return useMutation((data: API.SubtaskCreate, token) => api.issues.createSubtask(issueId, data, token))
}

// ==================== Comment Hooks ====================

export function useComments(issueId: string | null, limit = 50, offset = 0) {
  return useQuery((token) => api.comments.getIssueComments(issueId!, limit, offset, token), {
    enabled: !!issueId,
  })
}

export function useCreateComment(issueId: string) {
  return useMutation((data: API.CommentCreate, token) => api.comments.createComment(issueId, data, token))
}

// ==================== Notification Hooks ====================

export function useNotifications(limit = 50, offset = 0, unreadOnly = false) {
  return useQuery((token) => api.notifications.getNotifications(limit, offset, unreadOnly, token))
}

export function useUnreadCount() {
  return useQuery((token) => api.notifications.getUnreadCount(token))
}

export function useMarkAsRead() {
  return useMutation((notificationId: string, token) =>
    api.notifications.markAsRead(notificationId, token)
  )
}

// ==================== Dashboard Hooks ====================

export function usePersonalDashboard() {
  return useQuery((token) => api.dashboard.getPersonalDashboard(token))
}

export function useProjectDashboard(projectId: string | null) {
  return useQuery((token) => api.dashboard.getProjectDashboard(projectId!, token), {
    enabled: !!projectId,
  })
}

export function useTeamStatistics(teamId: string | null, period = "30") {
  return useQuery((token) => api.dashboard.getTeamStatistics(teamId!, period, token), {
    enabled: !!teamId,
  })
}

// ==================== AI Hooks ====================

export function useGenerateSummary(issueId: string) {
  return useMutation((_, token) => api.ai.generateSummary(issueId, token))
}

export function useGenerateSuggestion(issueId: string) {
  return useMutation((_, token) => api.ai.generateSuggestion(issueId, token))
}

export function useSuggestLabels(issueId: string) {
  return useMutation((_, token) => api.ai.suggestLabels(issueId, token))
}

export function useDetectDuplicates(projectId: string) {
  return useMutation((title: string, token) => api.ai.detectDuplicates(projectId, title, token))
}

export function useSummarizeComments(issueId: string) {
  return useMutation((_, token) => api.ai.summarizeComments(issueId, token))
}
