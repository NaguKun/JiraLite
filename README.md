# Jira Lite MVP - Backend API

AI-Powered Issue Tracking Web Application backend built with FastAPI and Supabase.

## Features

✅ **Authentication**
- Email/Password signup and login
- Google OAuth integration
- Password reset via email
- JWT token-based authentication

✅ **Team Management**
- Create and manage teams
- Role-based access control (OWNER/ADMIN/MEMBER)
- Team invitations via email
- Activity logging

✅ **Project Management**
- Create projects within teams
- Archive and favorite projects
- Custom statuses and labels
- Project dashboards

✅ **Issue Tracking**
- Create and manage issues
- Kanban board with drag & drop
- Priority levels and labels
- Subtasks and comments
- Issue history tracking

✅ **AI Features**
- AI summary generation
- Solution suggestions
- Auto-label recommendations
- Duplicate detection
- Comment summarization
- Rate limiting

✅ **Notifications**
- In-app notifications
- Email notifications
- Real-time updates

✅ **Dashboards & Statistics**
- Personal dashboard
- Project dashboard
- Team statistics

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Email**: SendGrid
- **AI**: OpenAI / Anthropic Claude
- **Python**: 3.9+

## Installation

### Prerequisites

- Python 3.9 or higher
- Supabase account
- SendGrid account (for emails)
- Google Cloud Console project (for OAuth)
- OpenAI or Anthropic API key (for AI features)

### Step 1: Clone and Setup

```bash
# Navigate to project directory
cd "C:\Users\ADMIN\OneDrive\Desktop\Personal_project\New folder (3)"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Setup Supabase

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the `database_schema.sql` file
3. Go to Settings > API to get your:
   - Project URL
   - Anon public key
   - Service role key

### Step 3: Configure Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/google/callback`
5. Note your Client ID and Client Secret

### Step 4: Configure SendGrid

1. Create account at https://sendgrid.com
2. Create an API key with Mail Send permissions
3. Verify a sender email address

### Step 5: Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_random_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# AI (Choose one or both)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Redis (optional, for rate limiting)
REDIS_URL=redis://localhost:6379

# Application
API_V1_STR=/api/v1
PROJECT_NAME=Jira Lite API
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

## Running the Application

### Development Mode

```bash
# Make sure virtual environment is activated
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

### Production Mode

```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login with credentials
- `POST /logout` - Logout current user
- `POST /password-reset` - Request password reset
- `POST /password-reset/confirm` - Confirm password reset
- `POST /password-change` - Change password
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Handle Google OAuth callback
- `GET /me` - Get current user info

### Users (`/api/v1/users`)
- `GET /me` - Get my profile
- `PUT /me` - Update my profile
- `DELETE /me` - Delete my account
- `GET /{user_id}` - Get user profile
- `GET /` - Search users

### Teams (`/api/v1/teams`)
- `POST /` - Create team
- `GET /` - Get my teams
- `GET /{team_id}` - Get team details
- `PUT /{team_id}` - Update team
- `DELETE /{team_id}` - Delete team
- `GET /{team_id}/members` - Get team members
- `POST /{team_id}/invite` - Invite member
- `POST /invites/{token}/accept` - Accept invite
- `PUT /{team_id}/members/{user_id}/role` - Change member role
- `DELETE /{team_id}/members/{user_id}` - Kick member
- `POST /{team_id}/leave` - Leave team
- `GET /{team_id}/activity` - Get activity logs

### Projects (`/api/v1/projects`)
- `POST /teams/{team_id}/projects` - Create project
- `GET /teams/{team_id}/projects` - Get team projects
- `GET /{project_id}` - Get project details
- `PUT /{project_id}` - Update project
- `DELETE /{project_id}` - Delete project
- `POST /{project_id}/archive` - Archive project
- `POST /{project_id}/favorite` - Toggle favorite
- `GET /{project_id}/labels` - Get project labels
- `POST /{project_id}/labels` - Create label
- `GET /{project_id}/statuses` - Get custom statuses
- `POST /{project_id}/statuses` - Create custom status

### Issues (`/api/v1/issues`)
- `POST /projects/{project_id}/issues` - Create issue
- `GET /projects/{project_id}/issues` - Get project issues
- `GET /{issue_id}` - Get issue details
- `PUT /{issue_id}` - Update issue
- `PUT /{issue_id}/status` - Update issue status
- `DELETE /{issue_id}` - Delete issue
- `GET /{issue_id}/history` - Get issue history
- `POST /{issue_id}/subtasks` - Create subtask
- `GET /{issue_id}/subtasks` - Get subtasks

### Comments (`/api/v1/comments`)
- `POST /issues/{issue_id}/comments` - Create comment
- `GET /issues/{issue_id}/comments` - Get issue comments
- `PUT /{comment_id}` - Update comment
- `DELETE /{comment_id}` - Delete comment

### Notifications (`/api/v1/notifications`)
- `GET /` - Get my notifications
- `PUT /{notification_id}/read` - Mark as read
- `POST /mark-all-read` - Mark all as read

### Dashboard (`/api/v1/dashboard`)
- `GET /personal` - Get personal dashboard
- `GET /projects/{project_id}` - Get project dashboard
- `GET /teams/{team_id}/statistics` - Get team statistics

### AI Features (`/api/v1/ai`)
- `POST /issues/{issue_id}/summary` - Generate AI summary
- `POST /issues/{issue_id}/suggestion` - Generate AI suggestion
- `POST /issues/{issue_id}/labels/suggest` - Suggest labels
- `POST /issues/detect-duplicates` - Detect duplicate issues
- `POST /issues/{issue_id}/comments/summarize` - Summarize comments

## Data Limits

| Item | Limit |
|------|-------|
| Projects per team | 15 |
| Issues per project | 200 |
| Subtasks per issue | 20 |
| Labels per project | 20 |
| Labels per issue | 5 |
| Custom statuses per project | 5 (+ 3 default = 8 total) |
| Team name | 1-50 characters |
| Project name | 1-100 characters |
| Issue title | 1-200 characters |
| Issue description | 5000 characters |
| Comment content | 1-1000 characters |

## Security Features

- JWT token authentication (24-hour expiration)
- Row Level Security (RLS) on all tables
- Team membership verification on all endpoints
- Role-based access control
- Soft delete for data recovery
- Input validation with Pydantic
- SQL injection prevention
- CORS configuration

## Testing

To run tests (if implemented):

```bash
pytest tests/
```

## Deployment

### Using Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from .env
6. Deploy!

### Using Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Railway will auto-detect FastAPI
4. Add environment variables
5. Deploy!

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t jira-lite-api .
docker run -p 8000:8000 --env-file .env jira-lite-api
```

## Project Structure

```
.
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── users.py
│   │       │   ├── teams.py
│   │       │   ├── projects.py
│   │       │   ├── issues.py
│   │       │   ├── comments.py
│   │       │   ├── notifications.py
│   │       │   ├── dashboard.py
│   │       │   └── ai.py
│   │       └── router.py
│   ├── database/
│   │   └── supabase.py
│   ├── models/
│   │   └── schemas.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── email_service.py
│   │   └── ai_service.py
│   ├── config.py
│   └── main.py
├── database_schema.sql
├── requirements.txt
├── .env.example
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Check the API documentation at `/api/v1/docs`
- Review the database schema in `database_schema.sql`
- Check environment configuration in `.env.example`

## Notes

- All timestamps are in UTC
- Soft deletes are used for most entities (30-day recovery window)
- Rate limiting is implemented for AI features (10/min or 100/day per user)
- Email sending requires valid SendGrid configuration
- Google OAuth requires proper redirect URI configuration
