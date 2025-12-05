# Supabase Authentication Setup Guide

## 🎉 Authentication Simplified!

Your application now uses **Supabase Auth** for all authentication, making it much simpler and more secure than custom JWT implementation.

## What Changed

### ✅ Removed
- Custom Google OAuth implementation in backend
- Manual JWT token generation
- Google OAuth credentials in backend config
- Complex OAuth callback handling

### ✅ Added
- Direct Supabase Auth integration
- Automatic token refresh
- Built-in session management
- One-click Google OAuth (and other providers!)

## Setup Instructions

### 1. Configure Google OAuth in Supabase

1. **Go to your Supabase Dashboard**
   - Navigate to: Authentication > Providers
   - Find "Google" in the list

2. **Enable Google Provider**
   - Toggle "Google Enabled" to ON

3. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google+ API"
   - Go to "Credentials" > "Create Credentials" > "OAuth Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - Copy the Client ID and Client Secret

4. **Add Credentials to Supabase**
   - Back in Supabase Dashboard > Authentication > Providers > Google
   - Paste Client ID and Client Secret
   - Save

### 2. Update Environment Variables

#### Backend (.env)
```env
# Supabase (No Google OAuth credentials needed!)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev

# AI (Optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# App
API_V1_STR=/api/v1
PROJECT_NAME=Jira Lite API
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API URL (for non-auth endpoints)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Install Dependencies

#### Backend
```bash
# Remove old dependencies (if upgrading from previous version)
pip uninstall google-auth google-auth-oauthlib google-auth-httplib2 python-jose passlib sendgrid aiosmtplib -y

# Install updated requirements
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Start Your Application

```bash
# Terminal 1: Backend
python -m uvicorn src.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

## How Authentication Works Now

### Email/Password Authentication

**Frontend:**
```typescript
import { useAuth } from "@/contexts/auth-context"

const { login, signup } = useAuth()

// Login
await login(email, password)

// Signup
await signup(email, password, name)
```

**What happens:**
1. Frontend calls Supabase Auth directly
2. Supabase validates credentials and returns session
3. Session includes access token (JWT)
4. Token is automatically used for all API calls
5. Token is auto-refreshed by Supabase

### Google OAuth Authentication

**Frontend:**
```typescript
import { useAuth } from "@/contexts/auth-context"

const { loginWithGoogle } = useAuth()

// One line - that's it!
await loginWithGoogle()
```

**What happens:**
1. User clicks "Continue with Google"
2. Redirected to Google login
3. Google authenticates user
4. Redirected back to your app (`/auth/callback`)
5. Supabase creates session automatically
6. User is logged in!

### Making API Calls

**All API calls automatically include the Supabase token:**

```typescript
import { useTeams, useCreateTeam } from "@/hooks/use-api"

// Fetch data
const { data: teams, isLoading } = useTeams()

// Create data
const { mutate: createTeam } = useCreateTeam()
await createTeam({ name: "My Team" })
```

**Behind the scenes:**
- Hook gets token from Supabase session
- Token is sent to backend in Authorization header
- Backend verifies token with Supabase
- Backend returns data

## Features You Get for Free

### 1. **Automatic Token Refresh**
- Supabase automatically refreshes expired tokens
- No manual token management needed
- Sessions stay alive seamlessly

### 2. **Session Persistence**
- User stays logged in across browser refreshes
- Session stored securely in browser
- Auto-logout on token expiration

### 3. **Multiple OAuth Providers**
To add more OAuth providers (GitHub, Facebook, etc.):
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable the provider
3. Add credentials
4. Use in frontend:
   ```typescript
   await supabase.auth.signInWithOAuth({ provider: 'github' })
   ```

### 4. **Email Verification**
Enable in Supabase Dashboard > Authentication > Email Templates

### 5. **Password Reset**
Built-in password reset flow:
```typescript
// Send reset email
await supabase.auth.resetPasswordForEmail(email)

// Update password (on reset page)
await supabase.auth.updateUser({ password: newPassword })
```

### 6. **Magic Links**
Email-only authentication (no password):
```typescript
await supabase.auth.signInWithOtp({ email })
```

## API Endpoints

### Backend Auth Endpoints

The backend now has simplified auth endpoints:

- ✅ `POST /api/v1/auth/signup` - Email/password signup
- ✅ `POST /api/v1/auth/login` - Email/password login
- ✅ `POST /api/v1/auth/logout` - Logout
- ✅ `POST /api/v1/auth/password-reset` - Request password reset
- ✅ `POST /api/v1/auth/password-reset/confirm` - Confirm password reset
- ✅ `POST /api/v1/auth/password-change` - Change password
- ✅ `GET /api/v1/auth/me` - Get current user
- ❌ `GET /api/v1/auth/google` - REMOVED (handled by Supabase)
- ❌ `GET /api/v1/auth/google/callback` - REMOVED (handled by Supabase)

## Testing

### Test Email/Password Auth
1. Go to http://localhost:3000/signup
2. Create account with email and password
3. Should redirect to dashboard
4. Logout and login again

### Test Google OAuth
1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Select Google account
4. Should redirect to dashboard

### Test API Calls
1. Login to your app
2. Open browser DevTools > Network tab
3. Try creating a team or project
4. Check the Authorization header in requests
5. Should see: `Bearer eyJ...` (Supabase token)

## Troubleshooting

### "Invalid authentication credentials"
- Check that Supabase URL and anon key are correct
- Verify token is being sent in Authorization header
- Check backend can reach Supabase

### Google OAuth not working
- Verify OAuth credentials in Supabase Dashboard
- Check authorized redirect URIs in Google Console
- Should be: `https://your-project-ref.supabase.co/auth/v1/callback`

### Token expired errors
- Supabase should auto-refresh, but if not:
- Logout and login again
- Check browser console for errors

### CORS errors
- Verify `BACKEND_CORS_ORIGINS` in backend .env
- Should include: `["http://localhost:3000"]`
- Restart backend after changing .env

## Security Best Practices

### ✅ DO:
- Keep `SUPABASE_SERVICE_KEY` secret (never expose to frontend)
- Use `SUPABASE_ANON_KEY` in frontend (it's safe, protected by RLS)
- Enable Row Level Security (RLS) on all tables
- Use environment variables for all keys

### ❌ DON'T:
- Expose service key in frontend code
- Disable RLS on production tables
- Hardcode credentials
- Commit .env files to git

## Row Level Security (RLS)

Your database already has RLS policies! They work with Supabase Auth:

```sql
-- Example: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Example: Team members can view team data
CREATE POLICY "Team members can view team"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );
```

## Benefits Summary

| Feature | Before (Custom JWT) | After (Supabase Auth) |
|---------|--------------------|-----------------------|
| OAuth Setup | Complex backend code | Enable in dashboard |
| Token Refresh | Manual implementation | Automatic |
| Session Management | Custom localStorage | Built-in |
| Multiple Providers | Code for each | Click to enable |
| Security | Manual validation | Supabase handles it |
| Code Complexity | 200+ lines | ~50 lines |

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Backend API Docs**: http://localhost:8000/api/v1/docs
- **Frontend Guide**: `frontend/INTEGRATION_GUIDE.md`

## 🎊 You're Done!

Your authentication is now powered by Supabase Auth. Enjoy the simplicity!

**Quick Start:**
1. Configure Google OAuth in Supabase Dashboard
2. Update .env files with Supabase credentials
3. Run `npm install` in frontend
4. Start both servers
5. Test login/signup

That's it! 🚀
