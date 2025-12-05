# Jira Lite Frontend

AI-Powered Issue Tracking Web Application - Next.js Frontend

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Theme**: next-themes (Dark/Light mode)

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── dashboard/        # Dashboard pages (protected)
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── providers.tsx     # App providers
│   ├── kanban-board.tsx  # Kanban board component
│   ├── ai-panel.tsx      # AI features panel
│   └── ...
├── contexts/              # React contexts
│   └── auth-context.tsx  # Authentication context
├── hooks/                 # Custom React hooks
│   └── use-api.ts        # API data fetching hooks
├── lib/                   # Utilities
│   ├── api-client.ts     # Backend API client
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript types
│   └── api.ts            # API type definitions
└── public/               # Static assets
```

## Key Features

### ✅ Authentication
- Email/password signup and login
- Google OAuth integration (configured)
- Password reset
- Protected routes
- Session persistence

### ✅ Type-Safe API Integration
- Comprehensive TypeScript types
- 80+ API endpoint methods
- Automatic token management
- Error handling

### ✅ Custom Hooks
- `useAuth()` - Authentication state
- `useTeams()` - Fetch teams
- `useProjects()` - Fetch projects
- `useIssues()` - Fetch issues
- `useCreateIssue()` - Create issue
- And 25+ more...

### ✅ UI Components
- 70+ pre-built components
- Dark/Light theme support
- Responsive design
- Accessible (ARIA compliant)

## Usage Examples

### Authentication

```tsx
import { useAuth } from "@/contexts/auth-context"

export default function MyPage() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  )
}
```

### Fetching Data

```tsx
import { useTeams } from "@/hooks/use-api"

export default function TeamsList() {
  const { data: teams, isLoading, error } = useTeams()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {teams?.map((team) => (
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>
  )
}
```

### Creating Data

```tsx
import { useCreateTeam } from "@/hooks/use-api"
import { toast } from "sonner"

export default function CreateTeamForm() {
  const { mutate: createTeam, isLoading } = useCreateTeam()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createTeam({ name: "New Team" })
      toast.success("Team created!")
    } catch (error) {
      toast.error("Failed to create team")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isLoading}>
        Create Team
      </button>
    </form>
  )
}
```

### Protected Routes

```tsx
import { withAuth } from "@/contexts/auth-context"

function DashboardPage() {
  return <div>Protected Dashboard Content</div>
}

export default withAuth(DashboardPage)
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Environment Variables

Create `.env.local` file:

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Optional (for production)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## API Integration

### API Client

All API calls are in `lib/api-client.ts`:

```typescript
import { api } from "@/lib/api-client"

// Usage
const teams = await api.teams.getMyTeams(token)
const issue = await api.issues.createIssue(projectId, data, token)
```

### Custom Hooks

All hooks are in `hooks/use-api.ts`:

```typescript
// Teams
useTeams()
useCreateTeam()
useTeamMembers(teamId)

// Projects
useProjects(teamId)
useCreateProject(teamId)

// Issues
useIssues(projectId)
useCreateIssue(projectId)
useUpdateIssue(issueId)

// AI Features
useGenerateSummary(issueId)
useSuggestLabels(issueId)
```

## TypeScript Types

All API types are in `types/api.ts`:

```typescript
import type { Team, Issue, IssuePriority } from "@/types/api"

// Fully typed
const team: Team = { ... }
const issue: Issue = { ... }
const priority: IssuePriority = "HIGH"
```

## Styling

### Tailwind CSS

This project uses Tailwind CSS for styling:

```tsx
<div className="flex items-center gap-4 p-4 bg-background">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Theme

Supports dark/light mode:

```tsx
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  )
}
```

## Components

### UI Components

Pre-built components in `components/ui/`:

- Button, Input, Label
- Card, Dialog, Sheet
- Select, Checkbox, Radio
- Toast, Alert, Badge
- Table, Tabs, Accordion
- And 50+ more...

### Usage

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

## Forms

Using React Hook Form + Zod:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
})

export default function MyForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <input {...register("email")} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Best Practices

### 1. Always Use Hooks for API Calls
```tsx
// ✅ Good
const { data, isLoading } = useTeams()

// ❌ Bad
const [data, setData] = useState(null)
useEffect(() => {
  fetch('/api/teams').then(r => r.json()).then(setData)
}, [])
```

### 2. Handle Loading and Error States
```tsx
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />
```

### 3. Use TypeScript Types
```tsx
import type { Team } from "@/types/api"

interface Props {
  team: Team
}

export default function TeamCard({ team }: Props) {
  return <div>{team.name}</div>
}
```

### 4. Protect Authenticated Routes
```tsx
import { withAuth } from "@/contexts/auth-context"

function MyPage() {
  return <div>Protected Content</div>
}

export default withAuth(MyPage)
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api/v1
   ```
4. Deploy!

### Other Platforms

```bash
# Build
npm run build

# The output will be in .next folder
# Deploy .next folder to your hosting platform
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Type errors
```bash
npm run build
# Fix any TypeScript errors shown
```

### CORS errors
- Make sure backend is running
- Check backend CORS configuration
- Verify `NEXT_PUBLIC_API_URL` is correct

## Documentation

- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Backend Docs**: http://localhost:8000/api/v1/docs
- **Full Stack Quick Start**: `../FULLSTACK_QUICKSTART.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## Support

- Check browser console for errors (F12)
- Check Network tab for failed API calls
- Verify backend is running and accessible
- Check environment variables are set correctly

## License

MIT
