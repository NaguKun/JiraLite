# 🧪 Dummy Data Setup Guide

This guide will help you populate your Supabase database with realistic test data.

## 📋 What's Included

The dummy data script creates:
- **5 Users** (Alice, Bob, Charlie, Diana, Eve)
- **3 Teams** (Frontend, Backend, DevOps)
- **6 Projects** with descriptions
- **14 Issues** across different projects
- **10 Comments** on various issues
- **16 Subtasks** for issues
- **7 Labels** for categorization
- **9 Notifications** for different users
- **Activity logs** for team actions

## 🚀 Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for Testing)

#### Step 1: Create Database Schema
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `database_schema.sql`
5. Click **Run** to create all tables

#### Step 2: Create Test Users in Supabase Auth

Since Row Level Security (RLS) depends on authenticated users, you need to create users first.

Go to **Authentication** → **Users** → **Add user** and create these test users:

```
Email: alice@example.com
Password: password123
UUID: 11111111-1111-1111-1111-111111111111

Email: bob@example.com
Password: password123
UUID: 22222222-2222-2222-2222-222222222222

Email: charlie@example.com
Password: password123
UUID: 33333333-3333-3333-3333-333333333333

Email: diana@example.com
Password: password123
UUID: 44444444-4444-4444-4444-444444444444

Email: eve@example.com
Password: password123
UUID: 55555555-5555-5555-5555-555555555555
```

**Note:** When creating users in Supabase Dashboard, you can't specify custom UUIDs. Instead:

#### Alternative Step 2: Disable RLS Temporarily (Easier)

For development/testing, you can temporarily disable RLS:

1. In SQL Editor, run:
```sql
-- Temporarily disable RLS on all tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
```

2. Then run the dummy data script
3. After testing, **re-enable RLS** for production:
```sql
-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
```

#### Step 3: Insert Dummy Data

1. Go back to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `seed_dummy_data.sql`
4. Click **Run**
5. You should see success messages in the output

### Option 2: Using Database Client (pgAdmin, DBeaver, etc.)

1. Get your Supabase connection details:
   - Go to **Project Settings** → **Database**
   - Copy the connection string

2. Connect using your favorite PostgreSQL client

3. Execute `database_schema.sql` first

4. Disable RLS temporarily (see SQL above)

5. Execute `seed_dummy_data.sql`

6. Re-enable RLS when done

## 🧪 Testing the Data

### Login Credentials

Use these emails to test different user perspectives:

| Email | Role | Teams |
|-------|------|-------|
| alice@example.com | Owner | Frontend Team (Owner), Backend Team (Admin) |
| bob@example.com | Owner | Backend Team (Owner), Frontend Team (Admin) |
| charlie@example.com | Owner | DevOps Team (Owner), Frontend Team (Member) |
| diana@example.com | Member | Frontend Team, DevOps Team |
| eve@example.com | Member | Backend Team |

**Password for all:** `password123` (or whatever you set)

### Test Scenarios

1. **Dashboard:**
   - Login as Alice → See assigned issues, teams, recent comments

2. **Projects:**
   - Alice can see 3 Frontend Team projects
   - Bob can see 2 Backend Team projects + 3 Frontend Team projects
   - Charlie can see DevOps + Frontend projects

3. **Kanban Board:**
   - Go to "Mobile App Redesign" project
   - See issues in different columns (Backlog, In Progress, Done)
   - Create new issues
   - Click issues to view details

4. **Comments:**
   - Open any issue detail page
   - See existing comments with user avatars
   - Add new comments

5. **Team Management:**
   - View team members
   - Invite new members (use a real email to test)
   - Create new teams

6. **Notifications:**
   - Check notification page for each user
   - Mark notifications as read
   - Delete notifications

## 📊 Data Overview

### Projects Structure

**Frontend Team Projects:**
1. Mobile App Redesign (5 issues)
2. Dashboard Analytics (3 issues)
3. Component Library

**Backend Team Projects:**
1. API Gateway (3 issues)
2. Microservices Migration

**DevOps Team Projects:**
1. CI/CD Pipeline (2 issues)

### Issue Distribution

| Status | Count |
|--------|-------|
| Backlog | 6 |
| In Progress | 5 |
| Done | 3 |

| Priority | Count |
|----------|-------|
| HIGH | 7 |
| MEDIUM | 5 |
| LOW | 2 |

## 🔧 Customization

### Adding More Data

You can easily add more dummy data by:

1. **More Users:** Copy the INSERT INTO user_profiles pattern
2. **More Teams:** Copy the INSERT INTO teams pattern
3. **More Issues:** Use the issues template with new UUIDs

### Clearing Data

To start fresh:

```sql
-- Clear all data (keeps schema)
TRUNCATE notifications, activity_logs, comments, subtasks,
         issue_labels, labels, issue_history, issues,
         custom_statuses, project_favorites, projects,
         team_invites, team_members, teams, user_profiles CASCADE;
```

Then re-run `seed_dummy_data.sql`

## ⚠️ Important Notes

### For Development
- RLS can be disabled for easier testing
- Use simple passwords like `password123`
- UUIDs are hardcoded for consistency

### For Production
- **Never** disable RLS in production
- Use strong passwords
- Let Supabase generate UUIDs
- Remove or modify dummy data
- Use environment-specific seeds

## 🎯 Next Steps

After seeding data:

1. **Test Authentication:**
   - Try logging in as different users
   - Test password reset flow

2. **Test Features:**
   - Create projects
   - Create issues
   - Add comments
   - Invite team members
   - Check notifications

3. **Test Permissions:**
   - Verify users only see their team's data
   - Test admin vs member permissions
   - Try unauthorized actions (should fail)

4. **Test AI Features:**
   - Generate summaries for issues
   - Get AI suggestions
   - Check if results are cached

## 📝 Troubleshooting

### "Permission denied" errors
- Check if RLS is enabled
- Make sure you're authenticated as one of the test users
- Verify the user is a member of the team

### "Foreign key violation" errors
- Make sure you ran the schema first
- Check that UUIDs match exactly
- Verify parent records exist

### "Duplicate key" errors
- Data might already exist
- Run the TRUNCATE command to clear data
- Check for conflicts in unique constraints

## 🎉 Success!

If everything works, you should be able to:
- ✅ Login with test users
- ✅ See projects and issues
- ✅ Create and edit content
- ✅ View team members
- ✅ Receive notifications
- ✅ Use all features end-to-end

Happy testing! 🚀
