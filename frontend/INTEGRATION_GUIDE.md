# Frontend-Backend Integration Guide

## 🎉 Integration Complete!

Your Next.js frontend is now fully integrated with the FastAPI backend!

## What Was Added

### 1. TypeScript Types (`types/api.ts`)
- ✅ Complete type definitions matching all backend schemas
- ✅ Enums for TeamRole, IssuePriority, IssueStatus
- ✅ Interfaces for all API request/response models
- ✅ 40+ type definitions covering the entire API

### 2. API Client (`lib/api-client.ts`)
- ✅ Comprehensive API client with all backend endpoints
- ✅ Organized into modules: auth, users, teams, projects, issues, comments, notifications, dashboard, AI
- ✅ Type-safe requests and responses
- ✅ Automatic authorization header handling
- ✅ Error handling and parsing

### 3. Authentication Context (`contexts/auth-context.tsx`)
- ✅ Global authentication state management
- ✅ Login/signup/logout functions
- ✅ Automatic token persistence in localStorage
- ✅ User profile management
- ✅ Protected route HOC (`withAuth`)
- ✅ Toast notifications for auth events

### 4. Custom Hooks (`hooks/use-api.ts`)
- ✅ Generic `useQuery` and `useMutation` hooks
- ✅ Specialized hooks for all API endpoints:
  - `useTeams()`, `useCreateTeam()`
  - `useProjects()`, `useCreateProject()`
  - `useIssues()`, `useCreateIssue()`
  - `useComments()`, `useCreateComment()`
  - `useNotifications()`, `useUnreadCount()`
  - AI hooks: `useGenerateSummary()`, `useSuggestLabels()`, etc.

### 5. Updated Pages
- ✅ Login page (`app/login/page.tsx`) - Connected to backend
- ✅ Signup page (`app/signup/page.tsx`) - Connected to backend
- ✅ Root layout with AuthProvider

## Setup Instructions

### 1. Configure Environment

Create `.env.local` file in the frontend directory:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Point to your backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies (if not already done)

```bash
cd frontend
npm install
# or
pnpm install
```

### 3. Start Development Server

Make sure your backend is running first!

```bash
# Terminal 1: Start backend
cd ../
python -m uvicorn src.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000
Backend will run on: http://localhost:8000

## Usage Examples

### Authentication

#### Login
```tsx
"use client"

import { useAuth } from "@/contexts/auth-context"

export default function MyPage() {
  const { login, user, isAuthenticated } = useAuth()

  const handleLogin = async () => {
    try {
      await login({ email: "test@example.com", password: "password123" })
      // Automatically redirects to /dashboard
    } catch (error) {
      // Error toast already shown
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

#### Protected Route
```tsx
import { withAuth } from "@/contexts/auth-context"

function ProtectedPage() {
  return <div>This page requires authentication</div>
}

export default withAuth(ProtectedPage)
```

### Fetching Data

#### Teams
```tsx
"use client"

import { useTeams, useCreateTeam } from "@/hooks/use-api"

export default function TeamsPage() {
  const { data: teams, isLoading, error, refetch } = useTeams()
  const { mutate: createTeam, isLoading: isCreating } = useCreateTeam()

  const handleCreate = async () => {
    try {
      await createTeam({ name: "My New Team" })
      refetch() // Refresh the list
    } catch (error) {
      console.error("Failed to create team:", error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={handleCreate} disabled={isCreating}>
        Create Team
      </button>
      <ul>
        {teams?.map((team) => (
          <li key={team.id}>{team.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### Issues with Filters
```tsx
import { useIssues } from "@/hooks/use-api"

export default function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: backlogIssues } = useIssues(projectId, "Backlog")
  const { data: inProgressIssues } = useIssues(projectId, "In Progress")
  const { data: doneIssues } = useIssues(projectId, "Done")

  return (
    <div className="flex gap-4">
      <Column title="Backlog" issues={backlogIssues} />
      <Column title="In Progress" issues={inProgressIssues} />
      <Column title="Done" issues={doneIssues} />
    </div>
  )
}
```

### Creating Data

#### Create Issue
```tsx
import { useCreateIssue } from "@/hooks/use-api"
import { IssuePriority } from "@/types/api"

export default function CreateIssueForm({ projectId }: { projectId: string }) {
  const { mutate: createIssue, isLoading } = useCreateIssue(projectId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createIssue({
        title: "New Bug",
        description: "Description here",
        priority: IssuePriority.HIGH,
        labels: ["bug-id-1", "urgent-id-2"],
      })
    } catch (error) {
      console.error("Failed to create issue:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Issue"}
      </button>
    </form>
  )
}
```

### AI Features

#### Generate Summary
```tsx
import { useGenerateSummary } from "@/hooks/use-api"

export default function IssueDetail({ issueId }: { issueId: string }) {
  const { mutate: generateSummary, data, isLoading } = useGenerateSummary(issueId)

  return (
    <div>
      <button onClick={() => generateSummary(undefined)} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate AI Summary"}
      </button>
      {data && (
        <div className="mt-4">
          <p>{data.result}</p>
          {data.cached && <span>Cached</span>}
        </div>
      )}
    </div>
  )
}
```

### Notifications

#### Display Notifications
```tsx
import { useNotifications, useMarkAsRead, useUnreadCount } from "@/hooks/use-api"

export default function NotificationBell() {
  const { data: unreadCount } = useUnreadCount()
  const { data: notifications } = useNotifications(50, 0, false)
  const { mutate: markAsRead } = useMarkAsRead()

  return (
    <div>
      <button className="relative">
        🔔
        {unreadCount && unreadCount.unread_count > 0 && (
          <span className="badge">{unreadCount.unread_count}</span>
        )}
      </button>
      <div className="dropdown">
        {notifications?.map((notif) => (
          <div key={notif.id} onClick={() => markAsRead(notif.id)}>
            {notif.title}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Dashboard

#### Personal Dashboard
```tsx
import { usePersonalDashboard } from "@/hooks/use-api"

export default function Dashboard() {
  const { data: dashboard, isLoading } = usePersonalDashboard()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>My Assigned Issues: {dashboard?.total_assigned}</h2>
      <div>
        <h3>Due Today</h3>
        <ul>
          {dashboard?.due_today.map((issue) => (
            <li key={issue.id}>{issue.title}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

## API Reference

### Available API Modules

All APIs are accessible via the `api` object from `lib/api-client.ts`:

```typescript
import { api } from "@/lib/api-client"

// All available modules:
api.auth.*        // Authentication
api.users.*       // User management
api.teams.*       // Team management
api.projects.*    // Project management
api.issues.*      // Issue tracking
api.comments.*    // Comments
api.notifications.* // Notifications
api.dashboard.*   // Dashboard & statistics
api.ai.*          // AI features
```

### Available Hooks

All hooks are in `hooks/use-api.ts`:

**Teams:**
- `useTeams()` - Get all teams
- `useTeam(teamId)` - Get specific team
- `useTeamMembers(teamId)` - Get team members
- `useCreateTeam()` - Create team mutation
- `useInviteMember(teamId)` - Invite member mutation

**Projects:**
- `useProjects(teamId)` - Get team projects
- `useProject(projectId)` - Get specific project
- `useCreateProject(teamId)` - Create project
- `useLabels(projectId)` - Get project labels
- `useCreateLabel(projectId)` - Create label

**Issues:**
- `useIssues(projectId, status?)` - Get project issues
- `useIssue(issueId)` - Get specific issue
- `useCreateIssue(projectId)` - Create issue
- `useUpdateIssue(issueId)` - Update issue
- `useUpdateIssueStatus(issueId)` - Update status
- `useSubtasks(issueId)` - Get subtasks
- `useCreateSubtask(issueId)` - Create subtask

**Comments:**
- `useComments(issueId)` - Get issue comments
- `useCreateComment(issueId)` - Create comment

**Notifications:**
- `useNotifications()` - Get notifications
- `useUnreadCount()` - Get unread count
- `useMarkAsRead()` - Mark notification as read

**Dashboard:**
- `usePersonalDashboard()` - Personal dashboard
- `useProjectDashboard(projectId)` - Project dashboard
- `useTeamStatistics(teamId)` - Team statistics

**AI:**
- `useGenerateSummary(issueId)` - Generate AI summary
- `useGenerateSuggestion(issueId)` - Generate solution suggestion
- `useSuggestLabels(issueId)` - Suggest labels
- `useDetectDuplicates(projectId)` - Detect duplicates
- `useSummarizeComments(issueId)` - Summarize comments

## Error Handling

All hooks automatically handle errors and provide error states:

```tsx
const { data, isLoading, error, refetch } = useTeams()

if (error) {
  return <div>Error: {error.message}</div>
}
```

For mutations, errors are thrown so you can catch them:

```tsx
const { mutate: createTeam } = useCreateTeam()

try {
  await createTeam({ name: "New Team" })
} catch (error) {
  console.error("Failed:", error)
  // Handle error
}
```

## Loading States

All hooks provide loading states:

```tsx
const { data, isLoading } = useTeams()

if (isLoading) {
  return <Spinner />
}
```

## Data Refetching

All query hooks return a `refetch` function:

```tsx
const { data, refetch } = useTeams()

// Manually refetch data
<button onClick={refetch}>Refresh</button>
```

## Type Safety

All hooks and API calls are fully typed:

```tsx
import type { Team, TeamCreate } from "@/types/api"

const { data: teams } = useTeams() // teams is Team[] | null
const { mutate } = useCreateTeam()

// TypeScript will enforce correct shape
mutate({ name: "Team" }) // ✅ Correct
mutate({ invalidField: "value" }) // ❌ TypeScript error
```

## Next Steps

1. **Update existing components** to use the new hooks:
   - Replace mock data with real API calls
   - Add loading and error states
   - Handle authentication requirements

2. **Protect routes** that need authentication:
   ```tsx
   export default withAuth(YourComponent)
   ```

3. **Add environment variables** for different environments:
   ```env
   # .env.local (development)
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

   # .env.production (production)
   NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
   ```

4. **Test the integration**:
   - Try signing up
   - Create a team
   - Create a project
   - Create issues
   - Test AI features

## Testing

### Manual Testing Checklist

- [ ] Sign up with new account
- [ ] Log in with existing account
- [ ] Create a team
- [ ] Invite team members
- [ ] Create a project
- [ ] Create issues
- [ ] Add comments
- [ ] Try AI features
- [ ] Check notifications
- [ ] View dashboard

### Common Issues

**CORS Errors:**
- Make sure backend CORS is configured for your frontend URL
- Check `BACKEND_CORS_ORIGINS` in backend `.env`

**401 Unauthorized:**
- Token might be expired (24-hour expiration)
- Try logging out and logging back in

**Connection Refused:**
- Make sure backend server is running
- Check `NEXT_PUBLIC_API_URL` points to correct backend URL

## Support

- Backend API Docs: http://localhost:8000/api/v1/docs
- Backend source: `../src/`
- Frontend types: `types/api.ts`
- API client: `lib/api-client.ts`
- Hooks: `hooks/use-api.ts`

## 🎉 You're All Set!

Your frontend is now fully integrated with the backend. Start building your components using the provided hooks and enjoy type-safe, easy-to-use API integration!
