from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from uuid import UUID

# Enums
class TeamRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"

class IssuePriority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class IssueStatus(str, Enum):
    BACKLOG = "Backlog"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

# Auth Schemas
class UserSignup(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=100)
    name: str = Field(..., min_length=1, max_length=50)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# User Profile Schemas
class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    profile_image: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    name: str
    profile_image: Optional[str]
    auth_provider: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class TeamUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class TeamResponse(BaseModel):
    id: UUID
    name: str
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    member_count: Optional[int] = 0
    my_role: Optional[str] = None

    class Config:
        from_attributes = True

# Team Member Schemas
class TeamMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: TeamRole
    joined_at: datetime
    user: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

class TeamMemberRoleUpdate(BaseModel):
    role: TeamRole

# Team Invite Schemas
class TeamInviteCreate(BaseModel):
    invitee_email: EmailStr
    role: TeamRole = TeamRole.MEMBER

class TeamInviteResponse(BaseModel):
    id: UUID
    team_id: UUID
    inviter_id: UUID
    invitee_email: str
    role: TeamRole
    expires_at: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)

class ProjectResponse(BaseModel):
    id: UUID
    team_id: UUID
    name: str
    description: Optional[str]
    owner_id: UUID
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    issue_count: Optional[int] = 0
    is_favorited: Optional[bool] = False

    class Config:
        from_attributes = True

# Label Schemas
class LabelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')

class LabelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=30)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')

class LabelResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    color: str
    created_at: datetime

    class Config:
        from_attributes = True

# Custom Status Schemas
class CustomStatusCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=30)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    position: int
    wip_limit: Optional[int] = Field(None, ge=1, le=50)

class CustomStatusUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=30)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    position: Optional[int] = None
    wip_limit: Optional[int] = Field(None, ge=1, le=50)

class CustomStatusResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    color: Optional[str]
    position: int
    wip_limit: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# Issue Schemas
class IssueCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    assignee_user_id: Optional[UUID] = None
    due_date: Optional[date] = None
    priority: IssuePriority = IssuePriority.MEDIUM
    labels: Optional[List[UUID]] = []

class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = None
    assignee_user_id: Optional[UUID] = None
    due_date: Optional[date] = None
    priority: Optional[IssuePriority] = None
    labels: Optional[List[UUID]] = None

class IssueStatusUpdate(BaseModel):
    status: str
    position: Optional[int] = None

class IssueResponse(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    description: Optional[str]
    status: str
    priority: IssuePriority
    assignee_user_id: Optional[UUID]
    owner_id: UUID
    due_date: Optional[date]
    position: int
    ai_summary: Optional[str]
    ai_suggestion: Optional[str]
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserProfileResponse] = None
    owner: Optional[UserProfileResponse] = None
    labels: Optional[List[LabelResponse]] = []
    subtask_count: Optional[int] = 0
    comment_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Subtask Schemas
class SubtaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    is_completed: Optional[bool] = None
    position: Optional[int] = None

class SubtaskResponse(BaseModel):
    id: UUID
    issue_id: UUID
    title: str
    is_completed: bool
    position: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Comment Schemas
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    id: UUID
    issue_id: UUID
    user_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str
    message: str
    link: Optional[str]
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True

# Activity Log Schemas
class ActivityLogResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    action_type: str
    entity_type: str
    entity_id: Optional[UUID]
    description: str
    metadata: Optional[dict]
    created_at: datetime
    user: Optional[UserProfileResponse] = None

    class Config:
        from_attributes = True

# AI Schemas
class AIGenerateRequest(BaseModel):
    description: str

class AIGenerateResponse(BaseModel):
    result: str
    cached: bool = False

class AILabelRecommendationRequest(BaseModel):
    title: str
    description: Optional[str]
    available_labels: List[LabelResponse]

class AILabelRecommendationResponse(BaseModel):
    recommended_labels: List[UUID]

# Dashboard Schemas
class ProjectDashboardResponse(BaseModel):
    issue_counts_by_status: dict
    completion_rate: float
    issue_counts_by_priority: dict
    recent_issues: List[IssueResponse]
    upcoming_due_issues: List[IssueResponse]

class PersonalDashboardResponse(BaseModel):
    assigned_issues: List[IssueResponse]
    total_assigned: int
    due_soon: List[IssueResponse]
    due_today: List[IssueResponse]
    recent_comments: List[CommentResponse]
    my_teams: List[TeamResponse]

class TeamStatisticsResponse(BaseModel):
    issue_creation_trend: List[dict]
    issue_completion_trend: List[dict]
    issues_by_member: List[dict]
    completed_by_member: List[dict]
    issues_by_project: List[dict]

# Search and Filter Schemas
class IssueFilter(BaseModel):
    status: Optional[List[str]] = None
    assignee: Optional[List[UUID]] = None
    priority: Optional[List[IssuePriority]] = None
    label: Optional[List[UUID]] = None
    has_due_date: Optional[bool] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
