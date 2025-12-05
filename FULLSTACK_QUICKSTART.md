# Full Stack Quick Start Guide

Get both backend and frontend running in 5 minutes!

## Prerequisites

- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ Supabase account set up
- ✅ Backend `.env` configured (see backend `QUICKSTART.md`)

## Step 1: Start Backend (2 minutes)

```bash
# Open Terminal 1

# Navigate to project root
cd "C:\Users\ADMIN\OneDrive\Desktop\Personal_project\New folder (3)"

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Start backend server
python -m uvicorn src.main:app --reload
```

✅ Backend running at: **http://localhost:8000**

## Step 2: Configure Frontend Environment (30 seconds)

```bash
# Open Terminal 2

# Navigate to frontend
cd frontend

# Create environment file
cp .env.local.example .env.local
```

Your `.env.local` should have:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Step 3: Install Frontend Dependencies (1 minute)

```bash
# Still in Terminal 2, inside frontend directory
npm install
# or
pnpm install
```

## Step 4: Start Frontend (30 seconds)

```bash
# Still in Terminal 2
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

## Step 5: Test It Works! (1 minute)

1. Open browser: **http://localhost:3000**
2. Click "Sign up"
3. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. You should be redirected to the dashboard!

## What You Now Have

✅ **Backend API** running with:
- All authentication endpoints
- Teams, Projects, Issues management
- AI features (with API keys configured)
- Email notifications (with SendGrid configured)
- Full Swagger docs at http://localhost:8000/api/v1/docs

✅ **Frontend App** running with:
- Authentication (login/signup working)
- TypeScript types for entire API
- Custom hooks for all endpoints
- Global auth state management
- Toast notifications

## Development Workflow

### Terminal 1: Backend
```bash
# Watch for Python code changes
python -m uvicorn src.main:app --reload

# Stop: Ctrl+C
```

### Terminal 2: Frontend
```bash
# Watch for Next.js changes
npm run dev

# Stop: Ctrl+C
```

## Quick Test Checklist

After starting both servers, test these:

1. **Authentication**
   - [ ] Sign up new user
   - [ ] Log in
   - [ ] Log out
   - [ ] Log in again

2. **Backend API**
   - [ ] Visit http://localhost:8000/api/v1/docs
   - [ ] Try "POST /auth/login" endpoint
   - [ ] Should see your user data

3. **Frontend Integration**
   - [ ] Open browser DevTools (F12)
   - [ ] Go to Network tab
   - [ ] Sign in
   - [ ] See POST request to `http://localhost:8000/api/v1/auth/login`
   - [ ] See successful response with token

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Windows:
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Check if port 3000 is in use
# Windows:
netstat -ano | findstr :3000

# Or use a different port
npm run dev -- -p 3001
```

### "Network Error" in frontend
- Make sure backend is running on port 8000
- Check `.env.local` has correct backend URL
- Open http://localhost:8000/health to verify backend

### CORS errors
- Check backend `.env` has: `BACKEND_CORS_ORIGINS=["http://localhost:3000"]`
- Restart backend after changing `.env`

### Authentication not working
- Check browser console for errors
- Check backend logs in Terminal 1
- Try clearing localStorage: `localStorage.clear()` in browser console
- Refresh page

## File Structure

```
New folder (3)/
├── src/                    # Backend (Python/FastAPI)
│   ├── api/
│   ├── models/
│   ├── services/
│   └── main.py
├── frontend/               # Frontend (Next.js/TypeScript)
│   ├── app/                # Pages
│   ├── components/         # React components
│   ├── contexts/           # Auth context
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API client
│   └── types/              # TypeScript types
├── requirements.txt        # Python dependencies
├── database_schema.sql     # Database schema
├── .env                    # Backend config
└── frontend/.env.local     # Frontend config
```

## Next Steps

1. **Read Integration Guide**
   ```bash
   cd frontend
   cat INTEGRATION_GUIDE.md
   ```

2. **Explore Backend API**
   - Visit: http://localhost:8000/api/v1/docs
   - Try endpoints with "Try it out"
   - See all available endpoints

3. **Update Frontend Components**
   - Use hooks from `hooks/use-api.ts`
   - See examples in `INTEGRATION_GUIDE.md`
   - Build your features!

4. **Check Backend README**
   ```bash
   cd ../
   cat README.md
   ```

## Useful Commands

### Backend
```bash
# Start dev server
python -m uvicorn src.main:app --reload

# Start with different port
python -m uvicorn src.main:app --reload --port 8001

# View logs (verbose)
python -m uvicorn src.main:app --reload --log-level debug
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## API Testing Tools

**Option 1: Swagger UI (Built-in)**
- URL: http://localhost:8000/api/v1/docs
- Interactive, no setup needed

**Option 2: curl**
```bash
# Sign up
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Option 3: Postman**
- Import: http://localhost:8000/api/v1/openapi.json

## Production Deployment

### Backend
- Deploy to: Render, Railway, Fly.io
- Set environment variables
- Use production database

### Frontend
- Deploy to: Vercel, Netlify
- Set `NEXT_PUBLIC_API_URL` to production backend
- Build: `npm run build`

## Getting Help

**Backend Issues:**
- Check: `README.md` (backend)
- Logs: Terminal 1
- API Docs: http://localhost:8000/api/v1/docs
- Database: Supabase Dashboard

**Frontend Issues:**
- Check: `frontend/INTEGRATION_GUIDE.md`
- Browser console: F12
- Network tab: Check API calls
- React DevTools: Install browser extension

**Integration Issues:**
- Verify both servers running
- Check environment variables
- Test backend directly in Swagger UI
- Check CORS configuration

## Success!

You now have a fully integrated full-stack application!

- 🚀 Backend API: http://localhost:8000
- 💻 Frontend App: http://localhost:3000
- 📚 API Docs: http://localhost:8000/api/v1/docs

Happy coding! 🎉
