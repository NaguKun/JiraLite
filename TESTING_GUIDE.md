# Complete Testing Guide - Jira Lite MVP

## ✅ Frontend-Backend Alignment Status

### Alignment Summary
- **Backend Status**: ✅ Running on http://127.0.0.1:8000
- **Frontend-Backend Sync**: ✅ 100% Aligned
- **Authentication**: ✅ Supabase Auth (simplified)
- **Email Service**: ✅ Resend (simplified)

### What Was Fixed
1. ✅ Removed old Google OAuth endpoints (now handled by Supabase)
2. ✅ Updated Pydantic schemas (v2 compatibility)
3. ✅ Installed Resend package
4. ✅ Fixed Windows console emoji encoding

## 📋 Pre-Testing Setup

### 1. Environment Variables

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=onboarding@resend.dev
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd "C:\Users\ADMIN\OneDrive\Desktop\Personal_project\New folder (3)"
python -m uvicorn src.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

### 3. Verify Servers Are Running
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/api/v1/docs

---

## 🧪 Feature Testing Checklist

### 1. Authentication (Supabase Auth)

#### ✅ Email/Password Signup
1. Go to http://localhost:3000/signup
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **Create account**
4. **Expected**: Redirect to `/dashboard` with success toast

**Test Cases:**
- ❌ Password too short (< 6 chars) → Error
- ❌ Passwords don't match → Error
- ❌ Email already exists → Error
- ✅ Valid data → Success

#### ✅ Email/Password Login
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Sign in**
4. **Expected**: Redirect to `/dashboard` with "Welcome back!" toast

**Test Cases:**
- ❌ Wrong email → Error
- ❌ Wrong password → Error
- ✅ Correct credentials → Success

#### ✅ Google OAuth Login
1. Go to http://localhost:3000/login
2. Click **Continue with Google**
3. **Expected**: Redirect to Google login
4. Select Google account
5. **Expected**: Redirect back to `/dashboard`

**Prerequisites:**
- Google OAuth must be configured in Supabase Dashboard
- See `SUPABASE_AUTH_SETUP.md` for setup

#### ✅ Logout
1. While logged in, click logout button (needs to be implemented in UI)
2. **Expected**: Redirect to `/login` with logout toast

#### ✅ Password Reset
**Backend Endpoints:**
- Request reset: `POST /api/v1/auth/password-reset`
- Confirm reset: `POST /api/v1/auth/password-reset/confirm`

**Test with cURL:**
```bash
# Request password reset
curl -X POST http://localhost:8000/api/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check Resend Dashboard for email
# Copy token from email link
# Confirm reset
curl -X POST http://localhost:8000/api/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{"token": "your-token", "new_password": "newpassword123"}'
```

---

### 2. User Profile Management

#### ✅ View My Profile
1. Login to app
2. API call: `GET /api/v1/users/me`
3. **Expected**: User profile data

**Test with cURL:**
```bash
# Get your token from browser DevTools > Application > Local Storage
TOKEN="your-supabase-token"

curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Update Profile
1. Update name or avatar
2. API call: `PUT /api/v1/users/me`

**Test with cURL:**
```bash
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

#### ✅ Search Users
**Test with cURL:**
```bash
curl "http://localhost:8000/api/v1/users?q=test" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Team Management

#### ✅ Create Team
1. API call: `POST /api/v1/teams`
2. **Expected**: New team created, you become OWNER

**Test with cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Test Team"}'
```

#### ✅ List My Teams
```bash
curl http://localhost:8000/api/v1/teams \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Get Team Details
```bash
TEAM_ID="your-team-id"
curl http://localhost:8000/api/v1/teams/$TEAM_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Update Team
```bash
curl -X PUT http://localhost:8000/api/v1/teams/$TEAM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Team Name"}'
```

#### ✅ Invite Team Member
```bash
curl -X POST http://localhost:8000/api/v1/teams/$TEAM_ID/invite \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invitee_email": "newmember@example.com", "role": "MEMBER"}'
```

**Expected:**
- Email sent to invitee via Resend
- Check Resend Dashboard for sent email
- Email contains invitation link

#### ✅ List Team Members
```bash
curl http://localhost:8000/api/v1/teams/$TEAM_ID/members \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Change Member Role
```bash
USER_ID="member-user-id"
curl -X PUT http://localhost:8000/api/v1/teams/$TEAM_ID/members/$USER_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

#### ✅ View Team Activity
```bash
curl http://localhost:8000/api/v1/teams/$TEAM_ID/activity \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Project Management

#### ✅ Create Project
```bash
curl -X POST http://localhost:8000/api/v1/projects/teams/$TEAM_ID/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "A test project"}'
```

#### ✅ List Team Projects
```bash
curl http://localhost:8000/api/v1/projects/teams/$TEAM_ID/projects \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Get Project Details
```bash
PROJECT_ID="your-project-id"
curl http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Update Project
```bash
curl -X PUT http://localhost:8000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Project", "description": "New description"}'
```

#### ✅ Favorite/Unfavorite Project
```bash
curl -X POST http://localhost:8000/api/v1/projects/$PROJECT_ID/favorite \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Create Custom Label
```bash
curl -X POST http://localhost:8000/api/v1/projects/$PROJECT_ID/labels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bug", "color": "#FF0000"}'
```

#### ✅ Create Custom Status
```bash
curl -X POST http://localhost:8000/api/v1/projects/$PROJECT_ID/statuses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "In Review", "color": "#FFA500", "position": 1}'
```

---

### 5. Issue Management

#### ✅ Create Issue
```bash
curl -X POST http://localhost:8000/api/v1/issues/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot login with Google",
    "priority": "HIGH",
    "due_date": "2025-12-31"
  }'
```

#### ✅ List Project Issues
```bash
curl http://localhost:8000/api/v1/issues/projects/$PROJECT_ID/issues \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Get Issue Details
```bash
ISSUE_ID="your-issue-id"
curl http://localhost:8000/api/v1/issues/$ISSUE_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Update Issue
```bash
curl -X PUT http://localhost:8000/api/v1/issues/$ISSUE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "status": "In Progress",
    "priority": "MEDIUM"
  }'
```

#### ✅ Assign Issue
```bash
curl -X PUT http://localhost:8000/api/v1/issues/$ISSUE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assignee_user_id": "user-id-here"}'
```

**Expected:**
- Issue assigned
- Email sent to assignee via Resend
- Notification created

---

### 6. Comments

#### ✅ Add Comment
```bash
curl -X POST http://localhost:8000/api/v1/comments/issues/$ISSUE_ID/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test comment"}'
```

**Expected:**
- Comment created
- Email notification sent to issue assignee
- Notification created

#### ✅ List Issue Comments
```bash
curl http://localhost:8000/api/v1/comments/issues/$ISSUE_ID/comments \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Update Comment
```bash
COMMENT_ID="your-comment-id"
curl -X PUT http://localhost:8000/api/v1/comments/$COMMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated comment"}'
```

#### ✅ Delete Comment
```bash
curl -X DELETE http://localhost:8000/api/v1/comments/$COMMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Notifications

#### ✅ List My Notifications
```bash
curl http://localhost:8000/api/v1/notifications/ \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Get Unread Count
```bash
curl http://localhost:8000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Mark Notification as Read
```bash
NOTIFICATION_ID="your-notification-id"
curl -X PUT http://localhost:8000/api/v1/notifications/$NOTIFICATION_ID/read \
  -H "Authorization: Bearer $TOKEN"
```

#### ✅ Mark All as Read
```bash
curl -X PUT http://localhost:8000/api/v1/notifications/mark-all-read \
  -H "Authorization: Bearer $TOKEN"
```

---

### 8. Dashboard & Statistics

#### ✅ Personal Dashboard
```bash
curl http://localhost:8000/api/v1/dashboard/personal \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Data:**
- Assigned issues
- Due soon issues
- Due today issues
- Recent comments
- My teams

#### ✅ Project Dashboard
```bash
curl http://localhost:8000/api/v1/dashboard/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Data:**
- Issue counts by status
- Completion rate
- Issue counts by priority
- Recent issues
- Upcoming due issues

#### ✅ Team Statistics
```bash
curl http://localhost:8000/api/v1/dashboard/teams/$TEAM_ID/statistics \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Data:**
- Issue creation trend
- Issue completion trend
- Issues by member
- Completed by member
- Issues by project

---

### 9. AI Features

**Prerequisites:**
- Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env`

#### ✅ Generate AI Summary
```bash
curl -X POST http://localhost:8000/api/v1/ai/issues/$ISSUE_ID/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- AI-generated summary based on issue title and description
- Cached for 1 hour

#### ✅ Generate AI Solution Suggestion
```bash
curl -X POST http://localhost:8000/api/v1/ai/issues/$ISSUE_ID/suggestion \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- AI-generated solution suggestions
- Cached for 1 hour

#### ✅ AI Label Suggestions
```bash
curl -X POST http://localhost:8000/api/v1/ai/issues/$ISSUE_ID/labels/suggest \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- Recommended labels based on issue content
- Returns label IDs from project

#### ✅ Detect Duplicate Issues
```bash
curl -X POST http://localhost:8000/api/v1/ai/issues/detect-duplicates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "User cannot login with email"}'
```

**Expected:**
- List of potentially duplicate issues

#### ✅ Summarize Comments
```bash
curl -X POST http://localhost:8000/api/v1/ai/issues/$ISSUE_ID/comments/summarize \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- AI-generated summary of all comments

---

## 🔍 Frontend Component Testing

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend Dev Server
```bash
npm run dev
```

### 3. Test Frontend Pages

#### ✅ Login Page (`/login`)
- Email/password login works
- Google OAuth button works
- Form validation works
- Error messages display
- Redirect to dashboard on success

#### ✅ Signup Page (`/signup`)
- Create account works
- Password validation works
- Confirm password validation works
- Google OAuth button works
- Redirect to dashboard on success

#### ✅ Dashboard Page (`/dashboard`)
**Needs to be built using hooks:**
```typescript
import { usePersonalDashboard } from "@/hooks/use-api"

const { data, isLoading, error } = usePersonalDashboard()
```

---

## 📊 Using Frontend Hooks

All API calls are available as React hooks:

```typescript
// Auth
const { login, signup, logout, loginWithGoogle } = useAuth()

// Teams
const { data: teams } = useTeams()
const { mutate: createTeam } = useCreateTeam()
const { mutate: updateTeam } = useUpdateTeam()

// Projects
const { data: projects } = useTeamProjects(teamId)
const { mutate: createProject } = useCreateProject(teamId)

// Issues
const { data: issues } = useProjectIssues(projectId)
const { mutate: createIssue } = useCreateIssue(projectId)
const { mutate: updateIssue } = useUpdateIssue(issueId)

// Comments
const { data: comments } = useIssueComments(issueId)
const { mutate: addComment } = useCreateComment(issueId)

// Notifications
const { data: notifications } = useNotifications()
const { data: unreadCount } = useUnreadNotificationsCount()

// Dashboard
const { data: personalDash } = usePersonalDashboard()
const { data: projectDash } = useProjectDashboard(projectId)

// AI
const { mutate: generateSummary } = useGenerateAISummary(issueId)
const { mutate: generateSuggestion } = useGenerateAISuggestion(issueId)
```

---

## 🐛 Common Issues & Solutions

### Backend Won't Start
- Check `.env` file exists and has correct values
- Verify `resend` package is installed: `pip install resend`
- Check console for errors

### Frontend Won't Start
- Run `npm install` in frontend folder
- Check `.env.local` exists
- Verify Node.js is installed

### Authentication Fails
- Check Supabase URL and keys are correct
- Verify Google OAuth is configured in Supabase
- Check browser console for errors

### Emails Not Sending
- Check `RESEND_API_KEY` is correct
- Verify `FROM_EMAIL` is valid
- Check Resend Dashboard for errors

### API Calls Fail
- Check backend is running on port 8000
- Verify token is being sent in headers
- Check CORS settings in backend

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database schema deployed to Supabase
- [ ] Google OAuth configured (if using)
- [ ] Resend API key configured
- [ ] Domain verified in Resend (for production emails)
- [ ] All tests passing
- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend requirements installed
- [ ] Row Level Security (RLS) enabled on all tables

---

## 📚 Documentation Reference

- **Supabase Auth Setup**: `SUPABASE_AUTH_SETUP.md`
- **Resend Setup**: `RESEND_SETUP.md`
- **Backend README**: `README.md`
- **Frontend Integration**: `frontend/INTEGRATION_GUIDE.md`
- **API Documentation**: http://localhost:8000/api/v1/docs

---

## 🎉 Success Metrics

Your integration is successful if:
- ✅ Backend API responds to all endpoints
- ✅ Frontend can authenticate users
- ✅ Teams, projects, and issues can be created
- ✅ Email notifications are sent
- ✅ AI features generate responses
- ✅ No console errors in browser or terminal
- ✅ Data persists in Supabase database

Happy testing! 🚀
