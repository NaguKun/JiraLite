# Quick Start Guide - Jira Lite Backend

Get your Jira Lite backend up and running in minutes!

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] Supabase account created
- [ ] SendGrid account created
- [ ] Google Cloud Console project set up (for OAuth)
- [ ] OpenAI or Anthropic API key obtained

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
# Navigate to project folder
cd "C:\Users\ADMIN\OneDrive\Desktop\Personal_project\New folder (3)"

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Setup Supabase (5 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for the project to finish initializing
3. Go to **SQL Editor** tab
4. Click "New Query"
5. Copy entire content from `database_schema.sql`
6. Paste and click "Run"
7. Go to **Settings > API**
8. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (click "Reveal" first)

### 3. Setup Google OAuth (3 minutes)

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Set authorized redirect URI:
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
6. Copy Client ID and Client Secret

### 4. Setup SendGrid (3 minutes)

1. Go to https://sendgrid.com
2. Create account (free tier works)
3. Go to **Settings > API Keys**
4. Click **Create API Key**
5. Give it "Mail Send" permissions
6. Copy the API key
7. Go to **Settings > Sender Authentication**
8. Verify an email address to send from

### 5. Get AI API Key (2 minutes)

**Option A: OpenAI**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy it

**Option B: Anthropic Claude**
1. Go to https://console.anthropic.com/
2. Get API key from dashboard
3. Copy it

### 6. Configure Environment (2 minutes)

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
# Supabase (from step 2)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...your_anon_key
SUPABASE_SERVICE_KEY=eyJhbGc...your_service_key

# JWT - Generate a random string
JWT_SECRET=your_super_secret_random_string_here_make_it_long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth (from step 3)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# SendGrid (from step 4)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@yourdomain.com

# AI - Choose one or both (from step 5)
OPENAI_API_KEY=sk-xxxxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional
REDIS_URL=redis://localhost:6379
API_V1_STR=/api/v1
PROJECT_NAME=Jira Lite API
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 7. Run the Server! (1 minute)

```bash
# Make sure virtual environment is activated
# Run the server
python -m uvicorn src.main:app --reload
```

You should see:

```
INFO:     Started server process
INFO:     Waiting for application startup.
🚀 Starting up Jira Lite API...
✅ Supabase initialized
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 8. Test It Works

Open your browser:

1. **API Root**: http://localhost:8000
   - Should see: `{"message": "Jira Lite API", "version": "1.0.0"}`

2. **API Docs**: http://localhost:8000/api/v1/docs
   - Interactive Swagger UI with all endpoints

3. **Health Check**: http://localhost:8000/health
   - Should see: `{"status": "healthy"}`

## First API Call

Let's create your first user!

### Using Swagger UI (Easiest)

1. Go to http://localhost:8000/api/v1/docs
2. Find **POST /api/v1/auth/signup**
3. Click "Try it out"
4. Fill in:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```
5. Click "Execute"
6. You should get back an access token!

### Using curl

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Common Issues

### "Module not found" errors
```bash
# Make sure you're in the virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### "Supabase connection failed"
- Check your `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Make sure you ran the `database_schema.sql` in Supabase

### "Email not sending"
- Verify your SendGrid API key
- Verify your sender email in SendGrid dashboard
- Check SendGrid dashboard for blocked/bounced emails

### Port 8000 already in use
```bash
# Use a different port
python -m uvicorn src.main:app --reload --port 8001
```

## Next Steps

1. **Test Authentication**
   - Try signup, login, password reset

2. **Create a Team**
   - Use `/api/v1/teams` endpoint

3. **Create a Project**
   - Use `/api/v1/projects/teams/{team_id}/projects`

4. **Create Issues**
   - Use `/api/v1/issues/projects/{project_id}/issues`

5. **Try AI Features**
   - Generate summaries: `/api/v1/ai/issues/{issue_id}/summary`

## API Documentation

Full API docs available at:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## Deployment

Ready to deploy? Check `README.md` for deployment instructions to:
- Render
- Railway
- Docker
- Vercel (with Docker)

## Getting Help

- Check `README.md` for detailed documentation
- Review `database_schema.sql` for data model
- Check Swagger docs for endpoint details
- Review PRD (`prd.pdf`) for feature requirements

## Development Tips

### Auto-reload
The `--reload` flag automatically restarts the server when you change code.

### View Logs
All logs appear in your terminal. Watch for errors there.

### Database GUI
Use Supabase Studio (in your Supabase dashboard) to view/edit data directly.

### Test with Postman
Import the OpenAPI spec from http://localhost:8000/api/v1/openapi.json

## Success! 🎉

Your Jira Lite backend is now running! Start building your frontend or test the API.

**Pro tip**: Keep the server running in one terminal, and open another terminal for testing with curl or running other commands.
