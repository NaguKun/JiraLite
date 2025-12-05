-- Dummy Data Script for Jira Lite
-- This script adds sample data for testing the application
-- Run this after setting up the database schema

-- NOTE: In production Supabase, user_profiles are created via auth.users
-- For testing, we'll directly insert profiles with known UUIDs

-- Clean existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE notifications, activity_logs, comments, subtasks, issue_labels, labels,
--          issue_history, issues, custom_statuses, project_favorites, projects,
--          team_invites, team_members, teams, user_profiles CASCADE;

-- ============================================
-- 1. USER PROFILES
-- ============================================
-- Insert dummy users (in real Supabase, these come from auth.users)
INSERT INTO user_profiles (id, name, email, profile_image, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice Johnson', 'alice@example.com', 'https://i.pravatar.cc/150?img=1', NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', 'Bob Smith', 'bob@example.com', 'https://i.pravatar.cc/150?img=2', NOW() - INTERVAL '25 days'),
('33333333-3333-3333-3333-333333333333', 'Charlie Davis', 'charlie@example.com', 'https://i.pravatar.cc/150?img=3', NOW() - INTERVAL '20 days'),
('44444444-4444-4444-4444-444444444444', 'Diana Prince', 'diana@example.com', 'https://i.pravatar.cc/150?img=4', NOW() - INTERVAL '15 days'),
('55555555-5555-5555-5555-555555555555', 'Eve Torres', 'eve@example.com', 'https://i.pravatar.cc/150?img=5', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. TEAMS
-- ============================================
INSERT INTO teams (id, name, owner_id, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Frontend Team', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Backend Team', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '25 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'DevOps Team', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. TEAM MEMBERS
-- ============================================
-- Frontend Team members
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
-- Alice is owner
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'OWNER', NOW() - INTERVAL '30 days'),
-- Bob is admin
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'ADMIN', NOW() - INTERVAL '28 days'),
-- Charlie is member
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'MEMBER', NOW() - INTERVAL '25 days'),
-- Diana is member
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'MEMBER', NOW() - INTERVAL '20 days'),

-- Backend Team members
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'OWNER', NOW() - INTERVAL '25 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'ADMIN', NOW() - INTERVAL '24 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'MEMBER', NOW() - INTERVAL '20 days'),

-- DevOps Team members
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'OWNER', NOW() - INTERVAL '20 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'MEMBER', NOW() - INTERVAL '18 days')
ON CONFLICT (team_id, user_id) DO NOTHING;

-- ============================================
-- 4. PROJECTS
-- ============================================
INSERT INTO projects (id, team_id, name, description, owner_id, created_at) VALUES
-- Frontend Team projects
('eeeeeeee-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Mobile App Redesign',
 'Complete redesign of the mobile application with new UI/UX and improved performance',
 '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '28 days'),

('eeeeeeee-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Dashboard Analytics',
 'Build comprehensive analytics dashboard for user insights and metrics',
 '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 days'),

('eeeeeeee-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Component Library',
 'Create reusable component library for consistent UI across applications',
 '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '15 days'),

-- Backend Team projects
('eeeeeeee-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'API Gateway',
 'Implement centralized API gateway with rate limiting and authentication',
 '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '22 days'),

('eeeeeeee-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'Microservices Migration',
 'Migrate monolithic application to microservices architecture',
 '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '18 days'),

-- DevOps Team projects
('eeeeeeee-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 'CI/CD Pipeline',
 'Set up automated CI/CD pipeline with testing and deployment',
 '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '19 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. LABELS
-- ============================================
INSERT INTO labels (id, project_id, name, color, created_at) VALUES
-- Labels for Mobile App Redesign
('dddddddd-1111-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111', 'bug', '#EF4444', NOW() - INTERVAL '28 days'),
('dddddddd-1112-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111', 'feature', '#3B82F6', NOW() - INTERVAL '28 days'),
('dddddddd-1113-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111', 'ui/ux', '#8B5CF6', NOW() - INTERVAL '28 days'),
('dddddddd-1114-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111', 'enhancement', '#10B981', NOW() - INTERVAL '28 days'),

-- Labels for API Gateway
('dddddddd-2111-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444', 'security', '#F59E0B', NOW() - INTERVAL '22 days'),
('dddddddd-2112-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444', 'performance', '#EC4899', NOW() - INTERVAL '22 days'),
('dddddddd-2113-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444', 'documentation', '#6366F1', NOW() - INTERVAL '22 days')
ON CONFLICT (project_id, name) DO NOTHING;

-- ============================================
-- 6. ISSUES
-- ============================================
INSERT INTO issues (id, project_id, title, description, status, priority, assignee_user_id, owner_id, due_date, created_at) VALUES
-- Mobile App Redesign issues
('ffffffff-1111-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111',
 'Fix login page responsive design',
 'The login page is not responsive on mobile devices. On screens smaller than 640px, the form gets cut off and the submit button is not clickable.',
 'In Progress', 'HIGH', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('ffffffff-1112-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111',
 'Implement dark mode toggle',
 'Add a dark mode toggle to the application settings. Should persist user preference in localStorage and apply theme across all pages.',
 'Backlog', 'MEDIUM', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '3 days'),

('ffffffff-1113-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111',
 'Add loading skeleton screens',
 'Implement skeleton loading screens for better UX while data is being fetched from the API.',
 'Done', 'LOW', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
 NULL, NOW() - INTERVAL '10 days'),

('ffffffff-1114-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111',
 'Update profile page design',
 'Redesign the profile page with better visual hierarchy and modern UI components.',
 'In Progress', 'MEDIUM', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 CURRENT_DATE + INTERVAL '7 days', NOW() - INTERVAL '2 days'),

('ffffffff-1115-1111-1111-111111111111', 'eeeeeeee-1111-1111-1111-111111111111',
 'Fix image upload bug',
 'Images over 5MB fail to upload. Need to add proper validation and error messaging.',
 'Backlog', 'HIGH', NULL, '33333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '3 days', NOW() - INTERVAL '1 day'),

-- Dashboard Analytics issues
('ffffffff-2111-1111-1111-111111111111', 'eeeeeeee-2222-2222-2222-222222222222',
 'Create charts for user metrics',
 'Implement interactive charts showing user engagement, retention, and growth metrics using Chart.js.',
 'In Progress', 'HIGH', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '8 days', NOW() - INTERVAL '6 days'),

('ffffffff-2112-1111-1111-111111111111', 'eeeeeeee-2222-2222-2222-222222222222',
 'Add export to CSV functionality',
 'Allow users to export analytics data to CSV format for external analysis.',
 'Backlog', 'MEDIUM', NULL, '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '4 days'),

('ffffffff-2113-1111-1111-111111111111', 'eeeeeeee-2222-2222-2222-222222222222',
 'Optimize query performance',
 'Dashboard loads slowly with large datasets. Need to optimize database queries and add caching.',
 'Done', 'HIGH', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 NULL, NOW() - INTERVAL '12 days'),

-- API Gateway issues
('ffffffff-3111-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444',
 'Implement rate limiting',
 'Add rate limiting middleware to prevent API abuse. Limit to 100 requests per minute per IP.',
 'In Progress', 'HIGH', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '4 days', NOW() - INTERVAL '8 days'),

('ffffffff-3112-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444',
 'Add API documentation',
 'Create comprehensive API documentation using Swagger/OpenAPI specification.',
 'Backlog', 'MEDIUM', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222',
 CURRENT_DATE + INTERVAL '12 days', NOW() - INTERVAL '5 days'),

('ffffffff-3113-1111-1111-111111111111', 'eeeeeeee-4444-4444-4444-444444444444',
 'Setup authentication middleware',
 'Implement JWT-based authentication middleware for all protected endpoints.',
 'Done', 'HIGH', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 NULL, NOW() - INTERVAL '15 days'),

-- CI/CD Pipeline issues
('ffffffff-4111-1111-1111-111111111111', 'eeeeeeee-6666-6666-6666-666666666666',
 'Configure GitHub Actions',
 'Set up GitHub Actions workflow for automated testing and deployment.',
 'In Progress', 'HIGH', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '6 days', NOW() - INTERVAL '7 days'),

('ffffffff-4112-1111-1111-111111111111', 'eeeeeeee-6666-6666-6666-666666666666',
 'Add automated tests',
 'Write unit and integration tests to be run in CI pipeline.',
 'Backlog', 'MEDIUM', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
 CURRENT_DATE + INTERVAL '14 days', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. ISSUE LABELS (Many-to-Many)
-- ============================================
INSERT INTO issue_labels (issue_id, label_id) VALUES
-- Mobile App issues
('ffffffff-1111-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111'), -- bug
('ffffffff-1111-1111-1111-111111111111', 'dddddddd-1113-1111-1111-111111111111'), -- ui/ux
('ffffffff-1112-1111-1111-111111111111', 'dddddddd-1112-1111-1111-111111111111'), -- feature
('ffffffff-1113-1111-1111-111111111111', 'dddddddd-1114-1111-1111-111111111111'), -- enhancement
('ffffffff-1114-1111-1111-111111111111', 'dddddddd-1113-1111-1111-111111111111'), -- ui/ux
('ffffffff-1115-1111-1111-111111111111', 'dddddddd-1111-1111-1111-111111111111'), -- bug

-- API Gateway issues
('ffffffff-3111-1111-1111-111111111111', 'dddddddd-2111-1111-1111-111111111111'), -- security
('ffffffff-3111-1111-1111-111111111111', 'dddddddd-2112-1111-1111-111111111111'), -- performance
('ffffffff-3112-1111-1111-111111111111', 'dddddddd-2113-1111-1111-111111111111'), -- documentation
('ffffffff-3113-1111-1111-111111111111', 'dddddddd-2111-1111-1111-111111111111')  -- security
ON CONFLICT (issue_id, label_id) DO NOTHING;

-- ============================================
-- 8. COMMENTS
-- ============================================
INSERT INTO comments (id, issue_id, user_id, content, created_at) VALUES
-- Comments on "Fix login page responsive design"
('cccccccc-1111-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'I can confirm this issue on iPhone 12. The form appears to overflow the viewport.',
 NOW() - INTERVAL '4 days'),

('cccccccc-1112-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'Working on this now. I''ve started refactoring the login form component to use CSS Grid for better responsiveness. Should have a PR ready by tomorrow.',
 NOW() - INTERVAL '3 days'),

('cccccccc-1113-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 '33333333-3333-3333-3333-333333333333',
 'Make sure to test on landscape mode too!',
 NOW() - INTERVAL '2 days'),

('cccccccc-1114-1111-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'Good point! I''ll add landscape orientation tests to the PR.',
 NOW() - INTERVAL '1 day'),

-- Comments on "Implement dark mode toggle"
('cccccccc-2111-1111-1111-111111111111', 'ffffffff-1112-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'Should we use a CSS-in-JS solution or CSS variables for theming?',
 NOW() - INTERVAL '2 days'),

('cccccccc-2112-1111-1111-111111111111', 'ffffffff-1112-1111-1111-111111111111',
 '33333333-3333-3333-3333-333333333333',
 'I recommend CSS variables for better performance and easier maintenance.',
 NOW() - INTERVAL '1 day'),

-- Comments on "Create charts for user metrics"
('cccccccc-3111-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'Started implementing the line chart for daily active users. Looking good so far!',
 NOW() - INTERVAL '3 days'),

('cccccccc-3112-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'Great! Can you also add a bar chart for user retention by cohort?',
 NOW() - INTERVAL '2 days'),

-- Comments on "Implement rate limiting"
('cccccccc-4111-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 '55555555-5555-5555-5555-555555555555',
 'Should we use Redis for rate limiting state or in-memory store?',
 NOW() - INTERVAL '5 days'),

('cccccccc-4112-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'Let''s go with Redis for distributed rate limiting across multiple instances.',
 NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. SUBTASKS
-- ============================================
INSERT INTO subtasks (id, issue_id, title, is_completed, position, created_at) VALUES
-- Subtasks for "Fix login page responsive design"
('ssssssss-1111-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 'Add media queries for mobile breakpoints', true, 0, NOW() - INTERVAL '4 days'),
('ssssssss-1112-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 'Test on iPhone 12 and 13', true, 1, NOW() - INTERVAL '4 days'),
('ssssssss-1113-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 'Test on Android devices', false, 2, NOW() - INTERVAL '4 days'),
('ssssssss-1114-1111-1111-111111111111', 'ffffffff-1111-1111-1111-111111111111',
 'Add landscape orientation support', false, 3, NOW() - INTERVAL '4 days'),

-- Subtasks for "Create charts for user metrics"
('ssssssss-2111-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 'Install Chart.js library', true, 0, NOW() - INTERVAL '6 days'),
('ssssssss-2112-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 'Create line chart component', true, 1, NOW() - INTERVAL '6 days'),
('ssssssss-2113-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 'Add bar chart for retention', false, 2, NOW() - INTERVAL '6 days'),
('ssssssss-2114-1111-1111-111111111111', 'ffffffff-2111-1111-1111-111111111111',
 'Add pie chart for user distribution', false, 3, NOW() - INTERVAL '6 days'),

-- Subtasks for "Implement rate limiting"
('ssssssss-3111-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 'Set up Redis connection', true, 0, NOW() - INTERVAL '8 days'),
('ssssssss-3112-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 'Create rate limiting middleware', false, 1, NOW() - INTERVAL '8 days'),
('ssssssss-3113-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 'Add error responses for rate limit exceeded', false, 2, NOW() - INTERVAL '8 days'),
('ssssssss-3114-1111-1111-111111111111', 'ffffffff-3111-1111-1111-111111111111',
 'Write unit tests', false, 3, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================
INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES
-- Notifications for Alice
('nnnnnnnn-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'ISSUE_ASSIGNED', 'Assigned to you',
 'You were assigned to "Update profile page design" by Bob Smith',
 '/dashboard/issues/ffffffff-1114-1111-1111-111111111111', false, NOW() - INTERVAL '2 days'),

('nnnnnnnn-1112-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'NEW_COMMENT', 'New comment',
 'Charlie commented on "Fix login page responsive design": Make sure to test on landscape mode too!',
 '/dashboard/issues/ffffffff-1111-1111-1111-111111111111', false, NOW() - INTERVAL '2 days'),

('nnnnnnnn-1113-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'ISSUE_STATUS_CHANGED', 'Status changed',
 '"Add loading skeleton screens" was moved to Done',
 '/dashboard/issues/ffffffff-1113-1111-1111-111111111111', true, NOW() - INTERVAL '5 days'),

-- Notifications for Bob
('nnnnnnnn-2111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 'ISSUE_ASSIGNED', 'Assigned to you',
 'You were assigned to "Fix login page responsive design" by Alice Johnson',
 '/dashboard/issues/ffffffff-1111-1111-1111-111111111111', true, NOW() - INTERVAL '5 days'),

('nnnnnnnn-2112-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
 'NEW_COMMENT', 'New comment',
 'Eve commented on "Implement rate limiting": Let''s go with Redis for distributed rate limiting',
 '/dashboard/issues/ffffffff-3111-1111-1111-111111111111', false, NOW() - INTERVAL '4 days'),

-- Notifications for Charlie
('nnnnnnnn-3111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
 'ISSUE_ASSIGNED', 'Assigned to you',
 'You were assigned to "Implement dark mode toggle" by Alice Johnson',
 '/dashboard/issues/ffffffff-1112-1111-1111-111111111111', false, NOW() - INTERVAL '3 days'),

('nnnnnnnn-3112-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
 'TEAM_INVITATION', 'Team invitation',
 'You were invited to join the "Backend Team" by Bob Smith',
 '/dashboard/team', true, NOW() - INTERVAL '24 days'),

-- Notifications for Diana
('nnnnnnnn-4111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444',
 'ISSUE_ASSIGNED', 'Assigned to you',
 'You were assigned to "Add automated tests" by Charlie Davis',
 '/dashboard/issues/ffffffff-4112-1111-1111-111111111111', false, NOW() - INTERVAL '4 days'),

-- Notifications for Eve
('nnnnnnnn-5111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555',
 'ISSUE_ASSIGNED', 'Assigned to you',
 'You were assigned to "Add API documentation" by Bob Smith',
 '/dashboard/issues/ffffffff-3112-1111-1111-111111111111', false, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. ACTIVITY LOGS
-- ============================================
INSERT INTO activity_logs (team_id, user_id, action_type, entity_type, entity_id, description, created_at) VALUES
-- Frontend Team activities
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
 'created', 'project', 'eeeeeeee-1111-1111-1111-111111111111',
 'Created project "Mobile App Redesign"', NOW() - INTERVAL '28 days'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
 'created', 'issue', 'ffffffff-1111-1111-1111-111111111111',
 'Created issue "Fix login page responsive design"', NOW() - INTERVAL '5 days'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333',
 'commented', 'issue', 'ffffffff-1111-1111-1111-111111111111',
 'Commented on "Fix login page responsive design"', NOW() - INTERVAL '2 days'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444',
 'status_changed', 'issue', 'ffffffff-1113-1111-1111-111111111111',
 'Moved "Add loading skeleton screens" to Done', NOW() - INTERVAL '5 days'),

-- Backend Team activities
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'created', 'project', 'eeeeeeee-4444-4444-4444-444444444444',
 'Created project "API Gateway"', NOW() - INTERVAL '22 days'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111',
 'status_changed', 'issue', 'ffffffff-3113-1111-1111-111111111111',
 'Moved "Setup authentication middleware" to Done', NOW() - INTERVAL '15 days'),

-- DevOps Team activities
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
 'created', 'project', 'eeeeeeee-6666-6666-6666-666666666666',
 'Created project "CI/CD Pipeline"', NOW() - INTERVAL '19 days'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444',
 'joined_team', 'team', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 'Joined the DevOps Team', NOW() - INTERVAL '18 days');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Dummy data inserted successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 5 Users';
    RAISE NOTICE '   - 3 Teams';
    RAISE NOTICE '   - 11 Team Members';
    RAISE NOTICE '   - 6 Projects';
    RAISE NOTICE '   - 7 Labels';
    RAISE NOTICE '   - 14 Issues';
    RAISE NOTICE '   - 10 Issue-Label associations';
    RAISE NOTICE '   - 10 Comments';
    RAISE NOTICE '   - 16 Subtasks';
    RAISE NOTICE '   - 9 Notifications';
    RAISE NOTICE '   - 8 Activity Logs';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test Users (use these for login if you create matching auth.users):';
    RAISE NOTICE '   - alice@example.com (Owner of Frontend Team)';
    RAISE NOTICE '   - bob@example.com (Owner of Backend Team)';
    RAISE NOTICE '   - charlie@example.com (Owner of DevOps Team)';
    RAISE NOTICE '   - diana@example.com (Member)';
    RAISE NOTICE '   - eve@example.com (Member)';
END $$;
