from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import *
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_project_access
from typing import List
from uuid import UUID

router = APIRouter()

# This is a comprehensive implementation stub
# Full implementation would include all issue management features
# FR-030 to FR-039-2

@router.post("/projects/{project_id}/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    project_id: UUID,
    issue_data: IssueCreate,
    current_user: dict = Depends(get_current_user)
):
    """FR-030: Create Issue"""
    try:
        await verify_project_access(project_id, current_user)
        supabase = get_supabase()

        # Check issue limit (max 200 per project)
        count = supabase.table("issues").select("id", count="exact").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").execute().count

        if count >= 200:
            raise HTTPException(status_code=400, detail="Maximum 200 issues per project")

        result = supabase.table("issues").insert({
            "project_id": str(project_id),
            "title": issue_data.title,
            "description": issue_data.description,
            "assignee_user_id": str(issue_data.assignee_user_id) if issue_data.assignee_user_id else None,
            "due_date": issue_data.due_date.isoformat() if issue_data.due_date else None,
            "priority": issue_data.priority.value,
            "owner_id": current_user["id"],
            "status": "Backlog"
        }).execute()

        return {**result.data[0], "subtask_count": 0, "comment_count": 0}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/projects/{project_id}/issues", response_model=List[IssueResponse])
async def get_project_issues(
    project_id: UUID,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """FR-031: Issue Detail View & FR-036: Issue Search/Filtering"""
    try:
        await verify_project_access(project_id, current_user)
        supabase = get_supabase()

        query = supabase.table("issues").select("*").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null")

        if status:
            query = query.eq("status", status)

        result = query.order("created_at", desc=True).execute()
        return result.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """FR-031: Issue Detail View"""
    try:
        supabase = get_supabase()

        result = supabase.table("issues").select("*").eq(
            "id", str(issue_id)
        ).is_("deleted_at", "null").single().execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=404, detail="Issue not found")

@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: UUID,
    issue_data: IssueUpdate,
    current_user: dict = Depends(get_current_user)
):
    """FR-032: Update Issue"""
    try:
        supabase = get_supabase()

        update_data = issue_data.dict(exclude_unset=True)
        result = supabase.table("issues").update(update_data).eq(
            "id", str(issue_id)
        ).execute()

        return result.data[0]

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{issue_id}")
async def delete_issue(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """FR-035: Delete Issue"""
    try:
        supabase = get_supabase()

        supabase.table("issues").update({"deleted_at": "now()"}).eq(
            "id", str(issue_id)
        ).execute()

        return {"message": "Issue deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
