# Resend Email Setup Guide

## Why Resend?

**Resend** is a modern email API that's much simpler than SendGrid:

✅ **Simpler API** - Just 3 lines of code to send an email
✅ **Better DX** - Clean, intuitive interface
✅ **Generous Free Tier** - 3,000 emails/month for free
✅ **Modern** - Built by developers, for developers
✅ **React Email Support** - Build emails with React (optional)

## Quick Setup

### 1. Create Account

1. Go to https://resend.com
2. Sign up with your email
3. Verify your email address

### 2. Get API Key

1. In the Resend Dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Jira Lite Production")
4. Click **Create**
5. Copy the API key (starts with `re_`)

**Important**: Save this key securely - you won't be able to see it again!

### 3. Configure Domain

#### Option A: Use Test Domain (Development)

Resend provides a test domain for development:
- **From Email**: `onboarding@resend.dev`
- No verification needed
- Good for testing

#### Option B: Add Your Domain (Production)

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Wait for verification (usually 1-5 minutes)
6. Once verified, you can send from any email at that domain

### 4. Update Environment Variables

Add to your `.env` file:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev  # Or your verified domain
```

### 5. Test Email Sending

The application is already configured to use Resend! Just:

1. Start your backend: `python -m uvicorn src.main:app --reload`
2. Try the password reset feature
3. Or invite a team member
4. Check the Resend Dashboard to see sent emails

## Email Templates in the App

Your app sends these emails using Resend:

1. **Password Reset** - When users request password reset
2. **Team Invitations** - When users are invited to teams
3. **Issue Assignments** - When issues are assigned
4. **Due Date Reminders** - When issues are approaching due date
5. **Comment Notifications** - When someone comments on an issue

All templates are beautifully styled with inline CSS!

## Resend vs SendGrid Comparison

| Feature | Resend | SendGrid |
|---------|--------|----------|
| **Setup Complexity** | Very Simple | Complex |
| **API Simplicity** | 3 lines of code | 10+ lines |
| **Free Tier** | 3,000/month | 100/day |
| **Modern UI** | ✅ Yes | ❌ Dated |
| **Developer Experience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Code Required** | Minimal | More boilerplate |
| **React Email Support** | ✅ Yes | ❌ No |

## Code Example

Here's how simple the code is with Resend:

```python
import resend

resend.api_key = "re_your_key"

# Send email - that's it!
email = resend.Emails.send({
    "from": "hello@yourdomain.com",
    "to": ["user@example.com"],
    "subject": "Welcome!",
    "html": "<h1>Hello World!</h1>"
})
```

Compare to SendGrid (old code):

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='hello@yourdomain.com',
    to_emails='user@example.com',
    subject='Welcome!',
    html_content='<h1>Hello World!</h1>'
)

sg = SendGridAPIClient(api_key)
response = sg.send(message)
```

**Resend is cleaner and simpler!**

## Monitoring & Analytics

Resend Dashboard provides:
- **Real-time delivery status**
- **Email open/click tracking** (optional)
- **Bounce and complaint handling**
- **Email preview**
- **Search and filter logs**

## Rate Limits

### Free Tier
- 3,000 emails per month
- 100 emails per day
- Good for development and small apps

### Paid Tiers (if you need more)
- **Pro**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

## Testing Tips

### 1. Test with Real Email
Send to your own email to verify delivery:
```bash
curl -X POST http://localhost:8000/api/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 2. Check Resend Dashboard
Go to **Emails** in Resend Dashboard to see:
- Sent emails
- Delivery status
- Email content preview

### 3. Use Test Mode
For automated tests, consider using a test email service like:
- https://mailtrap.io (email sandbox)
- Or mock the Resend API in tests

## Troubleshooting

### Emails not sending?

1. **Check API key**
   - Verify `RESEND_API_KEY` in `.env`
   - Make sure it starts with `re_`

2. **Check FROM email**
   - Must be from verified domain
   - Or use `onboarding@resend.dev` for testing

3. **Check Resend Dashboard**
   - Go to **Emails** tab
   - Look for errors or bounces

4. **Check console logs**
   - Backend will print errors to console
   - Look for "Email sending failed"

### Common Errors

**"Invalid API key"**
- API key is wrong or expired
- Generate a new one in Resend Dashboard

**"Unverified domain"**
- You're trying to send from an unverified domain
- Either verify your domain or use `onboarding@resend.dev`

**"Rate limit exceeded"**
- You've hit the free tier limit (3,000/month or 100/day)
- Upgrade to paid tier or wait for reset

## Best Practices

### 1. Use Environment Variables
Never hardcode API keys:
```python
# ✅ Good
resend.api_key = settings.RESEND_API_KEY

# ❌ Bad
resend.api_key = "re_abc123..."
```

### 2. Handle Errors Gracefully
```python
try:
    await send_email(...)
except Exception as e:
    print(f"Email failed: {e}")
    # Don't fail the whole operation
```

### 3. Use Proper FROM Name
```python
FROM_EMAIL = "Jira Lite <notifications@yourdomain.com>"
```

### 4. Test Email Templates
Before deploying, test all email templates:
- Password reset
- Team invitations
- Issue notifications

## Advanced Features (Optional)

### React Email
Build email templates with React:

```bash
npm install @react-email/components
```

```jsx
import { Button, Html } from '@react-email/components';

export default function Email() {
  return (
    <Html>
      <Button href="https://example.com">
        Click me
      </Button>
    </Html>
  );
}
```

Then send with Resend:
```python
resend.Emails.send({
    "from": "...",
    "to": "...",
    "react": "<YourReactComponent />"
})
```

### Email Scheduling
Schedule emails to send later:
```python
resend.Emails.send({
    "from": "...",
    "to": "...",
    "subject": "...",
    "html": "...",
    "scheduled_at": "2024-12-25T10:00:00Z"
})
```

## Support

- **Resend Docs**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **Community**: https://resend.com/discord

## Summary

Resend makes email **simple**:

1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_your_key
   FROM_EMAIL=onboarding@resend.dev
   ```
4. Start sending emails!

That's it! 🎉
