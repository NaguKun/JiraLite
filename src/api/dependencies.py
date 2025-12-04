from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.database.supabase import get_supabase
from uuid import UUID

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get current authenticated user from token.
    """
    try:
        supabase = get_supabase()
        token = credentials.credentials

        # Get user from Supabase
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

        # Get user profile
        profile_response = supabase.table("user_profiles").select("*").eq(
            "id", str(user_response.user.id)
        ).is_("deleted_at", "null").execute()

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        return profile_response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def verify_team_membership(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify that current user is a member of the specified team.
    FR-070: Team Membership Verification
    """
    try:
        supabase = get_supabase()

        membership = supabase.table("team_members").select("*").eq(
            "team_id", str(team_id)
        ).eq("user_id", current_user["id"]).execute()

        if not membership.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found or access denied"
            )

        return membership.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

async def verify_team_admin(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify that current user is an OWNER or ADMIN of the specified team.
    """
    membership = await verify_team_membership(team_id, current_user)

    if membership["role"] not in ["OWNER", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin or Owner role required."
        )

    return membership

async def verify_team_owner(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify that current user is the OWNER of the specified team.
    """
    membership = await verify_team_membership(team_id, current_user)

    if membership["role"] != "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Owner role required."
        )

    return membership

async def verify_project_access(
    project_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify that current user has access to the specified project.
    """
    try:
        supabase = get_supabase()

        # Get project and verify team membership
        project = supabase.table("projects").select(
            "*, teams!inner(id)"
        ).eq("id", str(project_id)).is_("deleted_at", "null").execute()

        if not project.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Verify team membership
        team_id = project.data[0]["team_id"]
        await verify_team_membership(UUID(team_id), current_user)

        return project.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

async def verify_issue_access(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify that current user has access to the specified issue.
    """
    try:
        supabase = get_supabase()

        # Get issue with project info
        issue = supabase.table("issues").select(
            "*, projects!inner(id, team_id)"
        ).eq("id", str(issue_id)).is_("deleted_at", "null").execute()

        if not issue.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found"
            )

        # Verify team membership
        team_id = issue.data[0]["projects"]["team_id"]
        await verify_team_membership(UUID(team_id), current_user)

        return issue.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
