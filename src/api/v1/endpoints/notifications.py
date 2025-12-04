from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import NotificationResponse
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """FR-090: In-App Notification"""
    try:
        supabase = get_supabase()

        query = supabase.table("notifications").select("*").eq(
            "user_id", current_user["id"]
        ).order("created_at", desc=True)

        if unread_only:
            query = query.eq("is_read", False)

        result = query.range(offset, offset + limit - 1).execute()

        return result.data

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """FR-091: Mark as Read"""
    try:
        supabase = get_supabase()

        result = supabase.table("notifications").update({
            "is_read": True,
            "read_at": "now()"
        }).eq("id", str(notification_id)).eq(
            "user_id", current_user["id"]
        ).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mark-all-read")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """FR-091: Mark as Read - Mark all"""
    try:
        supabase = get_supabase()

        supabase.table("notifications").update({
            "is_read": True,
            "read_at": "now()"
        }).eq("user_id", current_user["id"]).eq("is_read", False).execute()

        return {"message": "All notifications marked as read"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get unread notification count"""
    try:
        supabase = get_supabase()

        count = supabase.table("notifications").select(
            "id", count="exact"
        ).eq("user_id", current_user["id"]).eq("is_read", False).execute().count

        return {"unread_count": count}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
