from fastapi import APIRouter, HTTPException, Depends, status
from src.models.schemas import *
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_team_membership, verify_team_admin, verify_team_owner
from src.services.email_service import EmailService
from typing import List
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import secrets

router = APIRouter()
email_service = EmailService()

# Team CRUD Operations

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new team.
    FR-010: Create Team
    """
    try:
        supabase = get_supabase()

        # Create team
        team_result = supabase.table("teams").insert({
            "name": team_data.name,
            "owner_id": current_user["id"]
        }).execute()

        if not team_result.data:
            raise Exception("Failed to create team")

        team = team_result.data[0]

        # Add creator as OWNER in team_members
        supabase.table("team_members").insert({
            "team_id": team["id"],
            "user_id": current_user["id"],
            "role": "OWNER"
        }).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": team["id"],
            "user_id": current_user["id"],
            "action_type": "team_created",
            "entity_type": "team",
            "entity_id": team["id"],
            "description": f"{current_user['name']} created the team"
        }).execute()

        return {**team, "member_count": 1, "my_role": "OWNER"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[TeamResponse])
async def get_my_teams(current_user: dict = Depends(get_current_user)):
    """
    Get all teams the current user is a member of.
    FR-010, FR-011: View Teams
    """
    try:
        supabase = get_supabase()

        # Get teams with member info
        result = supabase.table("team_members").select(
            "role, teams!inner(id, name, owner_id, created_at, updated_at)"
        ).eq("user_id", current_user["id"]).execute()

        teams = []
        for item in result.data:
            team = item["teams"]
            # Get member count
            member_count = supabase.table("team_members").select(
                "id", count="exact"
            ).eq("team_id", team["id"]).execute().count

            teams.append({
                **team,
                "member_count": member_count,
                "my_role": item["role"]
            })

        return teams

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get team details.
    """
    try:
        membership = await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        team = supabase.table("teams").select("*").eq(
            "id", str(team_id)
        ).is_("deleted_at", "null").single().execute()

        member_count = supabase.table("team_members").select(
            "id", count="exact"
        ).eq("team_id", str(team_id)).execute().count

        return {**team.data, "member_count": member_count, "my_role": membership["role"]}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: UUID,
    team_data: TeamUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update team information.
    FR-011: Update Team
    """
    try:
        await verify_team_admin(team_id, current_user)
        supabase = get_supabase()

        result = supabase.table("teams").update({
            "name": team_data.name
        }).eq("id", str(team_id)).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "team_updated",
            "entity_type": "team",
            "entity_id": str(team_id),
            "description": f"{current_user['name']} updated team information"
        }).execute()

        return {**result.data[0], "my_role": "OWNER"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{team_id}")
async def delete_team(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete team (soft delete).
    FR-012: Delete Team
    """
    try:
        await verify_team_owner(team_id, current_user)
        supabase = get_supabase()

        # Soft delete team and all related entities
        supabase.table("teams").update({
            "deleted_at": "now()"
        }).eq("id", str(team_id)).execute()

        return {"message": "Team successfully deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Team Member Management

@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all members of a team.
    FR-014: View Members
    """
    try:
        await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        result = supabase.table("team_members").select(
            "*, user_profiles!inner(id, name, email, profile_image)"
        ).eq("team_id", str(team_id)).execute()

        members = []
        for item in result.data:
            member = {
                "id": item["id"],
                "user_id": item["user_id"],
                "role": item["role"],
                "joined_at": item["joined_at"],
                "user": item["user_profiles"]
            }
            members.append(member)

        return members

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{team_id}/invite")
async def invite_team_member(
    team_id: UUID,
    invite_data: TeamInviteCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Invite a new member to the team.
    FR-013: Invite Member
    """
    try:
        await verify_team_admin(team_id, current_user)
        supabase = get_supabase()

        # Check if user is already a member
        existing_member = supabase.table("team_members").select("id").eq(
            "team_id", str(team_id)
        ).eq("user_id", invite_data.invitee_email).execute()

        if existing_member.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a team member"
            )

        # Generate invite token
        invite_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)

        # Create invite
        invite = supabase.table("team_invites").insert({
            "team_id": str(team_id),
            "inviter_id": current_user["id"],
            "invitee_email": invite_data.invitee_email,
            "role": invite_data.role.value,
            "token": invite_token,
            "expires_at": expires_at.isoformat(),
            "status": "pending"
        }).execute()

        # Get team info
        team = supabase.table("teams").select("name").eq(
            "id", str(team_id)
        ).single().execute()

        # Send invitation email
        invite_link = f"http://localhost:3000/invite/{invite_token}"
        await email_service.send_team_invite_email(
            to_email=invite_data.invitee_email,
            team_name=team.data["name"],
            inviter_name=current_user["name"],
            invite_link=invite_link
        )

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "member_invited",
            "entity_type": "team_invite",
            "entity_id": invite.data[0]["id"],
            "description": f"{current_user['name']} invited {invite_data.invitee_email}"
        }).execute()

        return {"message": "Invitation sent successfully", "invite_id": invite.data[0]["id"]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/invites/{token}/accept")
async def accept_team_invite(
    token: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Accept a team invitation.
    FR-013: Invite Member - Accept
    """
    try:
        supabase = get_supabase()

        # Get invite
        invite = supabase.table("team_invites").select("*").eq(
            "token", token
        ).eq("status", "pending").single().execute()

        if not invite.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired invitation"
            )

        # Check expiration
        if datetime.fromisoformat(invite.data["expires_at"].replace('Z', '+00:00')) < datetime.utcnow().replace(tzinfo=None):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )

        # Add user to team
        supabase.table("team_members").insert({
            "team_id": invite.data["team_id"],
            "user_id": current_user["id"],
            "role": invite.data["role"]
        }).execute()

        # Update invite status
        supabase.table("team_invites").update({
            "status": "accepted"
        }).eq("id", invite.data["id"]).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": invite.data["team_id"],
            "user_id": current_user["id"],
            "action_type": "member_joined",
            "entity_type": "team_member",
            "description": f"{current_user['name']} joined the team"
        }).execute()

        return {"message": "Successfully joined the team"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{team_id}/members/{user_id}/role")
async def change_member_role(
    team_id: UUID,
    user_id: UUID,
    role_data: TeamMemberRoleUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Change a team member's role.
    FR-018: Change Role
    """
    try:
        await verify_team_owner(team_id, current_user)
        supabase = get_supabase()

        # Cannot change own role
        if str(user_id) == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own role"
            )

        result = supabase.table("team_members").update({
            "role": role_data.role.value
        }).eq("team_id", str(team_id)).eq("user_id", str(user_id)).execute()

        # Send notification
        supabase.table("notifications").insert({
            "user_id": str(user_id),
            "type": "role_change",
            "title": "Your role has been updated",
            "message": f"Your role in the team has been changed to {role_data.role.value}",
            "link": f"/teams/{team_id}"
        }).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "role_changed",
            "entity_type": "team_member",
            "description": f"{current_user['name']} changed a member's role to {role_data.role.value}"
        }).execute()

        return {"message": "Role updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{team_id}/members/{user_id}")
async def kick_team_member(
    team_id: UUID,
    user_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a member from the team.
    FR-015: Kick Member
    """
    try:
        membership = await verify_team_admin(team_id, current_user)
        supabase = get_supabase()

        # Get target member's role
        target = supabase.table("team_members").select("role").eq(
            "team_id", str(team_id)
        ).eq("user_id", str(user_id)).single().execute()

        # ADMIN can only kick MEMBER
        if membership["role"] == "ADMIN" and target.data["role"] != "MEMBER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admins can only kick regular members"
            )

        # Cannot kick yourself
        if str(user_id) == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot kick yourself. Use leave team instead."
            )

        # Remove from team
        supabase.table("team_members").delete().eq(
            "team_id", str(team_id)
        ).eq("user_id", str(user_id)).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "member_kicked",
            "entity_type": "team_member",
            "description": f"{current_user['name']} removed a member from the team"
        }).execute()

        return {"message": "Member removed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{team_id}/leave")
async def leave_team(
    team_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    Leave a team.
    FR-016: Leave Team
    """
    try:
        membership = await verify_team_membership(team_id, current_user)

        if membership["role"] == "OWNER":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owners cannot leave the team. Delete the team or transfer ownership first."
            )

        supabase = get_supabase()

        # Remove from team
        supabase.table("team_members").delete().eq(
            "team_id", str(team_id)
        ).eq("user_id", current_user["id"]).execute()

        # Log activity
        supabase.table("activity_logs").insert({
            "team_id": str(team_id),
            "user_id": current_user["id"],
            "action_type": "member_left",
            "entity_type": "team_member",
            "description": f"{current_user['name']} left the team"
        }).execute()

        return {"message": "Successfully left the team"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# Activity Logs

@router.get("/{team_id}/activity", response_model=List[ActivityLogResponse])
async def get_team_activity(
    team_id: UUID,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """
    Get team activity logs.
    FR-019: Team Activity Log
    """
    try:
        await verify_team_membership(team_id, current_user)
        supabase = get_supabase()

        result = supabase.table("activity_logs").select(
            "*, user_profiles!inner(id, name, email, profile_image)"
        ).eq("team_id", str(team_id)).order(
            "created_at", desc=True
        ).range(offset, offset + limit - 1).execute()

        activities = []
        for item in result.data:
            activity = {
                "id": item["id"],
                "team_id": item["team_id"],
                "user_id": item["user_id"],
                "action_type": item["action_type"],
                "entity_type": item["entity_type"],
                "entity_id": item.get("entity_id"),
                "description": item["description"],
                "metadata": item.get("metadata"),
                "created_at": item["created_at"],
                "user": item["user_profiles"]
            }
            activities.append(activity)

        return activities

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
