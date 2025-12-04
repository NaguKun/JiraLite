from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import PersonalDashboardResponse, ProjectDashboardResponse
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_project_access, verify_team_membership
from uuid import UUID
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/personal")
async def get_personal_dashboard(current_user: dict = Depends(get_current_user)):
    """
    FR-081: Personal Dashboard
    """
    try:
        supabase = get_supabase()

        # Get assigned issues
        assigned_issues = supabase.table("issues").select("*").eq(
            "assignee_user_id", current_user["id"]
        ).is_("deleted_at", "null").order("created_at", desc=True).limit(20).execute()

        # Get issues due soon (within 7 days)
        due_soon_date = (datetime.utcnow() + timedelta(days=7)).date().isoformat()
        due_soon = supabase.table("issues").select("*").eq(
            "assignee_user_id", current_user["id"]
        ).lte("due_date", due_soon_date).is_("deleted_at", "null").execute()

        # Get issues due today
        today = datetime.utcnow().date().isoformat()
        due_today = supabase.table("issues").select("*").eq(
            "assignee_user_id", current_user["id"]
        ).eq("due_date", today).is_("deleted_at", "null").execute()

        # Get recent comments
        recent_comments = supabase.table("comments").select(
            "*, issues!inner(title)"
        ).eq("user_id", current_user["id"]).is_("deleted_at", "null").order(
            "created_at", desc=True
        ).limit(5).execute()

        # Get my teams
        teams = supabase.table("team_members").select(
            "role, teams!inner(id, name, owner_id, created_at)"
        ).eq("user_id", current_user["id"]).execute()

        return {
            "assigned_issues": assigned_issues.data,
            "total_assigned": len(assigned_issues.data),
            "due_soon": due_soon.data,
            "due_today": due_today.data,
            "recent_comments": recent_comments.data,
            "my_teams": [{"my_role": t["role"], **t["teams"]} for t in teams.data]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/projects/{project_id}")
async def get_project_dashboard(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-080: Project Dashboard
    """
    try:
        await verify_project_access(project_id, current_user)
        supabase = get_supabase()

        # Get issue counts by status
        issues = supabase.table("issues").select("status").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").execute()

        status_counts = {}
        for issue in issues.data:
            status = issue["status"]
            status_counts[status] = status_counts.get(status, 0) + 1

        # Calculate completion rate
        total = len(issues.data)
        done_count = status_counts.get("Done", 0)
        completion_rate = (done_count / total * 100) if total > 0 else 0

        # Get issue counts by priority
        priority_counts = {}
        all_issues = supabase.table("issues").select("priority").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").execute()

        for issue in all_issues.data:
            priority = issue["priority"]
            priority_counts[priority] = priority_counts.get(priority, 0) + 1

        # Get recent issues
        recent_issues = supabase.table("issues").select("*").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").order("created_at", desc=True).limit(5).execute()

        # Get upcoming due issues
        upcoming_due = supabase.table("issues").select("*").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").gte(
            "due_date", datetime.utcnow().date().isoformat()
        ).lte(
            "due_date", (datetime.utcnow() + timedelta(days=7)).date().isoformat()
        ).limit(5).execute()

        return {
            "issue_counts_by_status": status_counts,
            "completion_rate": completion_rate,
            "issue_counts_by_priority": priority_counts,
            "recent_issues": recent_issues.data,
            "upcoming_due_issues": upcoming_due.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/teams/{team_id}/statistics")
async def get_team_statistics(
    team_id: UUID,
    period: str = "30",  # days
    current_user: dict = Depends(get_current_user)
):
    """
    FR-082: Team Statistics
    """
    try:
        await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        # Get projects for this team
        projects = supabase.table("projects").select("id").eq(
            "team_id", str(team_id)
        ).is_("deleted_at", "null").execute()

        project_ids = [p["id"] for p in projects.data]

        # Get issues by member
        issues_by_member = []
        members = supabase.table("team_members").select(
            "user_id, user_profiles!inner(name)"
        ).eq("team_id", str(team_id)).execute()

        for member in members.data:
            count = supabase.table("issues").select("id", count="exact").in_(
                "project_id", project_ids
            ).eq("assignee_user_id", member["user_id"]).is_("deleted_at", "null").execute().count

            issues_by_member.append({
                "user_name": member["user_profiles"]["name"],
                "count": count
            })

        return {
            "issue_creation_trend": [],  # Would implement with date grouping
            "issue_completion_trend": [],  # Would implement with date grouping
            "issues_by_member": issues_by_member,
            "completed_by_member": [],  # Would implement similarly
            "issues_by_project": []  # Would implement
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
