from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from src.config import settings
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    def __init__(self):
        self.from_email = settings.FROM_EMAIL
        self.sendgrid_key = settings.SENDGRID_API_KEY

    async def send_email(self, to_email: str, subject: str, html_content: str):
        """
        Send email using SendGrid
        FR-003, FR-013: Actual email sending required
        """
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )

            sg = SendGridAPIClient(self.sendgrid_key)
            response = sg.send(message)

            return response.status_code == 202

        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            raise Exception(f"Failed to send email: {str(e)}")

    async def send_password_reset_email(self, to_email: str, reset_link: str):
        """
        Send password reset email
        FR-003: Password Recovery/Reset
        """
        subject = "Reset Your Password - Jira Lite"
        html_content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for Jira Lite.</p>
                <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>Jira Lite Team</p>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)

    async def send_team_invite_email(
        self,
        to_email: str,
        team_name: str,
        inviter_name: str,
        invite_link: str
    ):
        """
        Send team invitation email
        FR-013: Invite Member - Email Sending
        """
        subject = f"You're invited to join {team_name} on Jira Lite"
        html_content = f"""
        <html>
            <body>
                <h2>Team Invitation</h2>
                <p>{inviter_name} has invited you to join the team "{team_name}" on Jira Lite.</p>
                <p>Click the link below to accept the invitation. This invitation will expire in 7 days.</p>
                <p><a href="{invite_link}">Accept Invitation</a></p>
                <p>If you don't have an account yet, you'll be able to sign up after clicking the link.</p>
                <p>Best regards,<br>Jira Lite Team</p>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)

    async def send_issue_assigned_email(
        self,
        to_email: str,
        assignee_name: str,
        issue_title: str,
        issue_link: str
    ):
        """
        Send notification when issue is assigned
        FR-090: In-App Notification - Issue assignee assigned
        """
        subject = f"You've been assigned to: {issue_title}"
        html_content = f"""
        <html>
            <body>
                <h2>New Issue Assignment</h2>
                <p>Hi {assignee_name},</p>
                <p>You have been assigned to a new issue:</p>
                <p><strong>{issue_title}</strong></p>
                <p><a href="{issue_link}">View Issue</a></p>
                <p>Best regards,<br>Jira Lite Team</p>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)

    async def send_due_date_reminder_email(
        self,
        to_email: str,
        assignee_name: str,
        issue_title: str,
        due_date: str,
        issue_link: str
    ):
        """
        Send reminder for approaching due date
        FR-090: Due date approaching notification
        """
        subject = f"Reminder: {issue_title} is due soon"
        html_content = f"""
        <html>
            <body>
                <h2>Due Date Reminder</h2>
                <p>Hi {assignee_name},</p>
                <p>This is a reminder that the following issue is due on {due_date}:</p>
                <p><strong>{issue_title}</strong></p>
                <p><a href="{issue_link}">View Issue</a></p>
                <p>Best regards,<br>Jira Lite Team</p>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)

    async def send_comment_notification_email(
        self,
        to_email: str,
        user_name: str,
        commenter_name: str,
        issue_title: str,
        comment_content: str,
        issue_link: str
    ):
        """
        Send notification for new comments
        FR-090: Comment written on issue
        """
        subject = f"New comment on: {issue_title}"
        html_content = f"""
        <html>
            <body>
                <h2>New Comment</h2>
                <p>Hi {user_name},</p>
                <p>{commenter_name} commented on "{issue_title}":</p>
                <blockquote>{comment_content}</blockquote>
                <p><a href="{issue_link}">View Issue</a></p>
                <p>Best regards,<br>Jira Lite Team</p>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)
