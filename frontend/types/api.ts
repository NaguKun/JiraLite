// TypeScript types matching backend API schemas

export enum TeamRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum IssuePriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum IssueStatus {
  BACKLOG = "Backlog",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
}

// Auth Types
export interface SignupRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

// User Types
export interface UserProfile {
  id: string
  email: string
  name: string
  profile_image: string | null
  auth_provider: string
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  name?: string
  profile_image?: string
}

// Team Types
export interface Team {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
  member_count?: number
  my_role?: TeamRole
}

export interface TeamCreate {
  name: string
}

export interface TeamUpdate {
  name: string
}

export interface TeamMember {
  id: string
  user_id: string
  role: TeamRole
  joined_at: string
  user?: UserProfile
}

export interface TeamInvite {
  invitee_email: string
  role: TeamRole
}

// Project Types
export interface Project {
  id: string
  team_id: string
  name: string
  description: string | null
  owner_id: string
  is_archived: boolean
  created_at: string
  updated_at: string
  issue_count?: number
  is_favorited?: boolean
}

export interface ProjectCreate {
  name: string
  description?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string
}

// Label Types
export interface Label {
  id: string
  project_id: string
  name: string
  color: string
  created_at: string
}

export interface LabelCreate {
  name: string
  color: string
}

// Custom Status Types
export interface CustomStatus {
  id: string
  project_id: string
  name: string
  color: string | null
  position: number
  wip_limit: number | null
  created_at: string
}

export interface CustomStatusCreate {
  name: string
  color?: string
  position: number
  wip_limit?: number
}

// Issue Types
export interface Issue {
  id: string
  project_id: string
  title: string
  description: string | null
  status: string
  priority: IssuePriority
  assignee_user_id: string | null
  owner_id: string
  due_date: string | null
  position: number
  ai_summary: string | null
  ai_suggestion: string | null
  created_at: string
  updated_at: string
  assignee?: UserProfile
  owner?: UserProfile
  labels?: Label[]
  subtask_count?: number
  comment_count?: number
}

export interface IssueCreate {
  title: string
  description?: string
  assignee_user_id?: string
  due_date?: string
  priority?: IssuePriority
  labels?: string[]
}

export interface IssueUpdate {
  title?: string
  description?: string
  status?: string
  assignee_user_id?: string
  due_date?: string
  priority?: IssuePriority
  labels?: string[]
}

export interface IssueStatusUpdate {
  status: string
  position?: number
}

// Subtask Types
export interface Subtask {
  id: string
  issue_id: string
  title: string
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface SubtaskCreate {
  title: string
}

export interface SubtaskUpdate {
  title?: string
  is_completed?: boolean
  position?: number
}

// Comment Types
export interface Comment {
  id: string
  issue_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: UserProfile
}

export interface CommentCreate {
  content: string
}

export interface CommentUpdate {
  content: string
}

// Notification Types
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
  read_at: string | null
}

// Activity Log Types
export interface ActivityLog {
  id: string
  team_id: string
  user_id: string
  action_type: string
  entity_type: string
  entity_id: string | null
  description: string
  metadata: any
  created_at: string
  user?: UserProfile
}

// Dashboard Types
export interface PersonalDashboard {
  assigned_issues: Issue[]
  total_assigned: number
  due_soon: Issue[]
  due_today: Issue[]
  recent_comments: Comment[]
  my_teams: Team[]
}

export interface ProjectDashboard {
  issue_counts_by_status: Record<string, number>
  completion_rate: number
  issue_counts_by_priority: Record<string, number>
  recent_issues: Issue[]
  upcoming_due_issues: Issue[]
}

export interface TeamStatistics {
  issue_creation_trend: any[]
  issue_completion_trend: any[]
  issues_by_member: any[]
  completed_by_member: any[]
  issues_by_project: any[]
}

// AI Types
export interface AIGenerateResponse {
  result: string
  cached: boolean
}

export interface AILabelRecommendation {
  recommended_labels: string[]
}

export interface AISimilarIssue {
  id: string
  title: string
  similarity: number
}

// API Error Response
export interface APIError {
  detail: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}
