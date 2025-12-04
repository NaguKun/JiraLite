from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import *
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_issue_access
from typing import List
from uuid import UUID

router = APIRouter()

@router.post("/issues/{issue_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    issue_id: UUID,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """FR-060: Create Comment"""
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        result = supabase.table("comments").insert({
            "issue_id": str(issue_id),
            "user_id": current_user["id"],
            "content": comment_data.content
        }).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/issues/{issue_id}/comments", response_model=List[CommentResponse])
async def get_issue_comments(
    issue_id: UUID,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """FR-061: Comment List"""
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        result = supabase.table("comments").select(
            "*, user_profiles!inner(id, name, email, profile_image)"
        ).eq("issue_id", str(issue_id)).is_("deleted_at", "null").order(
            "created_at", desc=False
        ).range(offset, offset + limit - 1).execute()

        return result.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: UUID,
    comment_data: CommentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """FR-062: Update Comment"""
    try:
        supabase = get_supabase()

        # Verify ownership
        comment = supabase.table("comments").select("user_id").eq(
            "id", str(comment_id)
        ).single().execute()

        if comment.data["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        result = supabase.table("comments").update({
            "content": comment_data.content
        }).eq("id", str(comment_id)).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """FR-063: Delete Comment"""
    try:
        supabase = get_supabase()

        supabase.table("comments").update({"deleted_at": "now()"}).eq(
            "id", str(comment_id)
        ).execute()

        return {"message": "Comment deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
