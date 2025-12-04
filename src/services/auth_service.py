from src.database.supabase import get_supabase, get_supabase_admin
from src.config import settings
from src.services.email_service import EmailService
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets
from datetime import datetime, timedelta
from uuid import UUID

class AuthService:
    def __init__(self):
        self.email_service = EmailService()

    async def signup(self, email: str, password: str, name: str) -> dict:
        """
        FR-001: Sign Up with email/password
        """
        try:
            supabase = get_supabase()

            # Sign up user
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name,
                        "provider": "email"
                    }
                }
            })

            if not auth_response.user:
                raise Exception("Failed to create user")

            # Return token and user info
            return {
                "access_token": auth_response.session.access_token,
                "token_type": "bearer",
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "name": name
                }
            }

        except Exception as e:
            raise Exception(f"Signup failed: {str(e)}")

    async def login(self, email: str, password: str) -> dict:
        """
        FR-002: Login/Logout
        """
        try:
            supabase = get_supabase()

            # Sign in user
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if not auth_response.user or not auth_response.session:
                raise Exception("Invalid credentials")

            # Get user profile
            profile = supabase.table("user_profiles").select("*").eq(
                "id", str(auth_response.user.id)
            ).is_("deleted_at", "null").single().execute()

            return {
                "access_token": auth_response.session.access_token,
                "token_type": "bearer",
                "user": profile.data
            }

        except Exception as e:
            raise Exception("Email or password is incorrect")

    async def request_password_reset(self, email: str):
        """
        FR-003: Password Recovery/Reset
        """
        try:
            supabase = get_supabase_admin()

            # Check if user exists
            user_response = supabase.table("user_profiles").select("*").eq(
                "email", email
            ).is_("deleted_at", "null").execute()

            if not user_response.data:
                # Don't reveal if email exists
                return

            user = user_response.data[0]

            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(hours=1)

            # Save token to database
            supabase.table("password_reset_tokens").insert({
                "user_id": user["id"],
                "token": reset_token,
                "expires_at": expires_at.isoformat(),
                "used": False
            }).execute()

            # Send email
            reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
            await self.email_service.send_password_reset_email(email, reset_link)

        except Exception as e:
            # Log error but don't expose to user
            print(f"Password reset error: {str(e)}")
            pass

    async def confirm_password_reset(self, token: str, new_password: str):
        """
        FR-003: Password Recovery/Reset - Confirm
        """
        try:
            supabase = get_supabase_admin()

            # Verify token
            token_response = supabase.table("password_reset_tokens").select("*").eq(
                "token", token
            ).eq("used", False).execute()

            if not token_response.data:
                raise Exception("Invalid token")

            token_data = token_response.data[0]

            # Check expiration
            if datetime.fromisoformat(token_data["expires_at"].replace('Z', '+00:00')) < datetime.utcnow().replace(tzinfo=None):
                raise Exception("Token expired")

            # Update password
            supabase.auth.admin.update_user_by_id(
                token_data["user_id"],
                {"password": new_password}
            )

            # Mark token as used
            supabase.table("password_reset_tokens").update({
                "used": True
            }).eq("id", token_data["id"]).execute()

        except Exception as e:
            raise Exception(f"Password reset failed: {str(e)}")

    async def change_password(self, user_id: str, current_password: str, new_password: str):
        """
        FR-006: Password Change
        """
        try:
            supabase = get_supabase()

            # Get user email
            user = supabase.table("user_profiles").select("email, auth_provider").eq(
                "id", user_id
            ).single().execute()

            if user.data["auth_provider"] != "email":
                raise Exception("Password change is not available for OAuth users")

            # Verify current password by attempting login
            try:
                supabase.auth.sign_in_with_password({
                    "email": user.data["email"],
                    "password": current_password
                })
            except:
                raise Exception("Current password is incorrect")

            # Update password
            supabase.auth.update_user({
                "password": new_password
            })

        except Exception as e:
            raise Exception(str(e))

    async def get_google_auth_url(self) -> str:
        """
        FR-004: Google OAuth Login - Get auth URL
        """
        from urllib.parse import urlencode

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }

        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    async def handle_google_callback(self, code: str) -> dict:
        """
        FR-004: Google OAuth Login - Handle callback
        """
        try:
            import httpx

            # Exchange code for tokens
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }

            async with httpx.AsyncClient() as client:
                token_response = await client.post(token_url, data=token_data)
                tokens = token_response.json()

            # Verify ID token
            id_info = id_token.verify_oauth2_token(
                tokens["id_token"],
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = id_info["email"]
            name = id_info.get("name", email.split("@")[0])
            google_id = id_info["sub"]

            supabase = get_supabase()

            # Check if user exists
            user_response = supabase.table("user_profiles").select("*").eq(
                "email", email
            ).is_("deleted_at", "null").execute()

            if user_response.data:
                # Existing user - create session
                user = user_response.data[0]
                # Note: In production, implement proper token generation
                # For now, create a session using Supabase
                auth_response = supabase.auth.sign_in_with_oauth({
                    "provider": "google",
                    "options": {
                        "redirect_to": settings.GOOGLE_REDIRECT_URI
                    }
                })
            else:
                # New user - sign up
                auth_response = supabase.auth.sign_up({
                    "email": email,
                    "password": secrets.token_urlsafe(32),  # Random password for OAuth users
                    "options": {
                        "data": {
                            "name": name,
                            "provider": "google",
                            "google_id": google_id
                        }
                    }
                })

            return {
                "access_token": tokens["id_token"],
                "token_type": "bearer",
                "user": {
                    "email": email,
                    "name": name
                }
            }

        except Exception as e:
            raise Exception(f"Google OAuth failed: {str(e)}")
