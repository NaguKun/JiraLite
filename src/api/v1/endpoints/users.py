from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import UserProfileUpdate, UserProfileResponse
from src.database.supabase import get_supabase, get_supabase_admin
from src.api.dependencies import get_current_user
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile.
    FR-005: Profile Management - View
    """
    return UserProfileResponse(**current_user)

@router.put("/me", response_model=UserProfileResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile.
    FR-005: Profile Management - Edit
    """
    try:
        supabase = get_supabase()

        update_data = profile_data.dict(exclude_unset=True)

        if not update_data:
            return UserProfileResponse(**current_user)

        result = supabase.table("user_profiles").update(
            update_data
        ).eq("id", current_user["id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )

        return UserProfileResponse(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/me")
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """
    Delete current user's account.
    FR-007: Account Deletion
    """
    try:
        supabase = get_supabase_admin()

        # Check if user owns any teams
        owned_teams = supabase.table("teams").select("id").eq(
            "owner_id", current_user["id"]
        ).is_("deleted_at", "null").execute()

        if owned_teams.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please delete owned teams or transfer ownership first"
            )

        # Soft delete user profile
        supabase.table("user_profiles").update({
            "deleted_at": "now()"
        }).eq("id", current_user["id"]).execute()

        # Delete auth user
        supabase.auth.admin.delete_user(current_user["id"])

        return {"message": "Account successfully deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(
    user_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get any user's profile (public info only).
    """
    try:
        supabase = get_supabase()

        user = supabase.table("user_profiles").select("*").eq(
            "id", str(user_id)
        ).is_("deleted_at", "null").single().execute()

        if not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserProfileResponse(**user.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

@router.get("/", response_model=List[UserProfileResponse])
async def search_users(
    q: str = "",
    current_user: dict = Depends(get_current_user)
):
    """
    Search users by name or email.
    """
    try:
        supabase = get_supabase()

        query = supabase.table("user_profiles").select("*").is_("deleted_at", "null")

        if q:
            # Simple search - in production, use full-text search
            query = query.or_(f"name.ilike.%{q}%,email.ilike.%{q}%")

        result = query.limit(10).execute()

        return [UserProfileResponse(**user) for user in result.data]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
