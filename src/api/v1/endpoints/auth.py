from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from src.models.schemas import (
    UserSignup, UserLogin, TokenResponse,
    PasswordReset, PasswordResetConfirm, PasswordChange
)
from src.database.supabase import get_supabase
from src.services.auth_service import AuthService
from src.services.email_service import EmailService
from src.api.dependencies import get_current_user
from uuid import UUID

router = APIRouter()
auth_service = AuthService()
email_service = EmailService()

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user with email and password.
    FR-001: Sign Up
    """
    try:
        result = await auth_service.signup(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name
        )
        return result
    except Exception as e:
        if "already registered" in str(e).lower() or "duplicate" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.
    FR-002: Login/Logout
    """
    try:
        result = await auth_service.login(
            email=credentials.email,
            password=credentials.password
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect"
        )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user.
    FR-002: Login/Logout
    """
    try:
        supabase = get_supabase()
        await supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/password-reset")
async def request_password_reset(reset_data: PasswordReset):
    """
    Request password reset via email.
    FR-003: Password Recovery/Reset
    """
    try:
        await auth_service.request_password_reset(reset_data.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm")
async def confirm_password_reset(reset_data: PasswordResetConfirm):
    """
    Confirm password reset with token and new password.
    FR-003: Password Recovery/Reset
    """
    try:
        await auth_service.confirm_password_reset(
            token=reset_data.token,
            new_password=reset_data.new_password
        )
        return {"message": "Password successfully reset"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

@router.post("/password-change")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """
    Change password for logged-in user.
    FR-006: Password Change
    """
    try:
        await auth_service.change_password(
            user_id=current_user["id"],
            current_password=password_data.current_password,
            new_password=password_data.new_password
        )
        return {"message": "Password successfully changed"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/google")
async def google_auth():
    """
    Initiate Google OAuth flow.
    FR-004: Google OAuth Login
    """
    try:
        auth_url = await auth_service.get_google_auth_url()
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/google/callback")
async def google_callback(code: str):
    """
    Handle Google OAuth callback.
    FR-004: Google OAuth Login
    """
    try:
        result = await auth_service.handle_google_callback(code)
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"http://localhost:3000/auth/callback?token={result['access_token']}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user
