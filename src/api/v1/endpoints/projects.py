from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import *
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_team_membership, verify_team_admin
from typing import List
from uuid import UUID

router = APIRouter()

@router.post("/teams/{team_id}/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    team_id: UUID,
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new project within a team.
    FR-020: Create Project
    """
    try:
        await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        # Check project limit (max 15 per team)
        count = supabase.table("projects").select("id", count="exact").eq(
            "team_id", str(team_id)
        ).is_("deleted_at", "null").execute().count

        if count >= 15:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team has reached maximum number of projects (15)"
            )

        # Create project
        result = supabase.table("projects").insert({
            "team_id": str(team_id),
            "name": project_data.name,
            "description": project_data.description,
            "owner_id": current_user["id"]
        }).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "project_created",
            "entity_type": "project",
            "entity_id": result.data[0]["id"],
            "description": f"{current_user['name']} created project '{project_data.name}'"
        }).execute()

        return {**result.data[0], "issue_count": 0, "is_favorited": False}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/teams/{team_id}/projects", response_model=List[ProjectResponse])
async def get_team_projects(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all projects for a team.
    FR-021: View Projects
    """
    try:
        await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        projects = supabase.table("projects").select("*").eq(
            "team_id", str(team_id)
        ).is_("deleted_at", "null").order("created_at", desc=True).execute()

        result = []
        for project in projects.data:
            # Get issue count
            issue_count = supabase.table("issues").select("id", count="exact").eq(
                "project_id", project["id"]
            ).is_("deleted_at", "null").execute().count

            # Check if favorited
            favorite = supabase.table("project_favorites").select("id").eq(
                "project_id", project["id"]
            ).eq("user_id", current_user["id"]).execute()

            result.append({
                **project,
                "issue_count": issue_count,
                "is_favorited": len(favorite.data) > 0
            })

        # Sort: favorites first, then by created_at
        result.sort(key=lambda x: (not x["is_favorited"], x["created_at"]), reverse=True)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get project details.
    FR-022: Project Detail Page
    """
    try:
        supabase = get_supabase()

        project = supabase.table("projects").select("*").eq(
            "id", str(project_id)
        ).is_("deleted_at", "null").single().execute()

        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        await verify_team_membership(UUID(project.data["team_id"]), current_user)

        # Get issue count
        issue_count = supabase.table("issues").select("id", count="exact").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").execute().count

        # Check if favorited
        favorite = supabase.table("project_favorites").select("id").eq(
            "project_id", str(project_id)
        ).eq("user_id", current_user["id"]).execute()

        return {
            **project.data,
            "issue_count": issue_count,
            "is_favorited": len(favorite.data) > 0
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update project.
    FR-023: Update Project
    """
    try:
        supabase = get_supabase()

        # Get project and check permissions
        project = supabase.table("projects").select("*, teams!inner(id)").eq(
            "id", str(project_id)
        ).is_("deleted_at", "null").single().execute()

        team_id = UUID(project.data["team_id"])
        membership = await verify_team_membership(team_id, current_user)

        # Only OWNER, ADMIN, or project owner can update
        if membership["role"] not in ["OWNER", "ADMIN"] and project.data["owner_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        update_data = project_data.dict(exclude_unset=True)
        result = supabase.table("projects").update(update_data).eq(
            "id", str(project_id)
        ).execute()

        return {**result.data[0], "issue_count": 0, "is_favorited": False}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete project (soft delete).
    FR-024: Delete Project
    """
    try:
        supabase = get_supabase()

        project = supabase.table("projects").select("*, teams!inner(id)").eq(
            "id", str(project_id)
        ).is_("deleted_at", "null").single().execute()

        team_id = UUID(project.data["team_id"])
        membership = await verify_team_membership(team_id, current_user)

        if membership["role"] not in ["OWNER", "ADMIN"] and project.data["owner_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        supabase.table("projects").update({"deleted_at": "now()"}).eq(
            "id", str(project_id)
        ).execute()

        return {"message": "Project deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{project_id}/favorite")
async def toggle_favorite(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Toggle project favorite status.
    FR-027: Favorite Project
    """
    try:
        supabase = get_supabase()

        # Check if already favorited
        existing = supabase.table("project_favorites").select("id").eq(
            "project_id", str(project_id)
        ).eq("user_id", current_user["id"]).execute()

        if existing.data:
            # Remove favorite
            supabase.table("project_favorites").delete().eq(
                "id", existing.data[0]["id"]
            ).execute()
            return {"message": "Removed from favorites", "is_favorited": False}
        else:
            # Add favorite
            supabase.table("project_favorites").insert({
                "project_id": str(project_id),
                "user_id": current_user["id"]
            }).execute()
            return {"message": "Added to favorites", "is_favorited": True}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Labels Management

@router.post("/{project_id}/labels", response_model=LabelResponse)
async def create_label(
    project_id: UUID,
    label_data: LabelCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a project label.
    FR-038: Issue Labels/Tags
    """
    try:
        supabase = get_supabase()

        # Check label limit (max 20 per project)
        count = supabase.table("labels").select("id", count="exact").eq(
            "project_id", str(project_id)
        ).execute().count

        if count >= 20:
            raise HTTPException(status_code=400, detail="Maximum 20 labels per project")

        result = supabase.table("labels").insert({
            "project_id": str(project_id),
            "name": label_data.name,
            "color": label_data.color
        }).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{project_id}/labels", response_model=List[LabelResponse])
async def get_project_labels(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all labels for a project.
    """
    try:
        supabase = get_supabase()

        result = supabase.table("labels").select("*").eq(
            "project_id", str(project_id)
        ).execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Custom Statuses

@router.post("/{project_id}/statuses", response_model=CustomStatusResponse)
async def create_custom_status(
    project_id: UUID,
    status_data: CustomStatusCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a custom status for project.
    FR-053: Custom Columns (Custom Status)
    """
    try:
        supabase = get_supabase()

        # Check limit (max 5 custom statuses)
        count = supabase.table("custom_statuses").select("id", count="exact").eq(
            "project_id", str(project_id)
        ).execute().count

        if count >= 5:
            raise HTTPException(status_code=400, detail="Maximum 5 custom statuses allowed")

        result = supabase.table("custom_statuses").insert({
            "project_id": str(project_id),
            "name": status_data.name,
            "color": status_data.color,
            "position": status_data.position,
            "wip_limit": status_data.wip_limit
        }).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{project_id}/statuses", response_model=List[CustomStatusResponse])
async def get_custom_statuses(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all custom statuses for a project.
    """
    try:
        supabase = get_supabase()

        result = supabase.table("custom_statuses").select("*").eq(
            "project_id", str(project_id)
        ).order("position").execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
