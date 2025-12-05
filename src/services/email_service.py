import resend
from src.config import settings

class EmailService:
    def __init__(self):
        self.from_email = settings.FROM_EMAIL
        resend.api_key = settings.RESEND_API_KEY

    async def send_email(self, to_email: str, subject: str, html_content: str):
        """
        Send email using Resend
        FR-003, FR-013: Actual email sending required
        """
        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            email = resend.Emails.send(params)
            return True

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
        <!DOCTYPE html>
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>You requested to reset your password for Jira Lite.</p>
                    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                    <div style="margin: 30px 0;">
                        <a href="{reset_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If you didn't request this, please ignore this email.
                    </p>
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Jira Lite Team</strong>
                    </p>
                </div>
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
        <!DOCTYPE html>
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Team Invitation</h2>
                    <p><strong>{inviter_name}</strong> has invited you to join the team
                       <strong>"{team_name}"</strong> on Jira Lite.</p>
                    <p>Click the button below to accept the invitation.
                       This invitation will expire in 7 days.</p>
                    <div style="margin: 30px 0;">
                        <a href="{invite_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        If you don't have an account yet, you'll be able to sign up after clicking the link.
                    </p>
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Jira Lite Team</strong>
                    </p>
                </div>
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
        <!DOCTYPE html>
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">New Issue Assignment</h2>
                    <p>Hi <strong>{assignee_name}</strong>,</p>
                    <p>You have been assigned to a new issue:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>{issue_title}</strong>
                    </div>
                    <div style="margin: 30px 0;">
                        <a href="{issue_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Issue
                        </a>
                    </div>
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Jira Lite Team</strong>
                    </p>
                </div>
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
        <!DOCTYPE html>
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #f59e0b;">⏰ Due Date Reminder</h2>
                    <p>Hi <strong>{assignee_name}</strong>,</p>
                    <p>This is a reminder that the following issue is due on
                       <strong style="color: #dc2626;">{due_date}</strong>:</p>
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px;
                                border-left: 4px solid #f59e0b; margin: 20px 0;">
                        <strong>{issue_title}</strong>
                    </div>
                    <div style="margin: 30px 0;">
                        <a href="{issue_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Issue
                        </a>
                    </div>
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Jira Lite Team</strong>
                    </p>
                </div>
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
        <!DOCTYPE html>
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">💬 New Comment</h2>
                    <p>Hi <strong>{user_name}</strong>,</p>
                    <p><strong>{commenter_name}</strong> commented on
                       <strong>"{issue_title}"</strong>:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;
                                border-left: 4px solid #2563eb; margin: 20px 0;">
                        <p style="margin: 0; font-style: italic;">{comment_content}</p>
                    </div>
                    <div style="margin: 30px 0;">
                        <a href="{issue_link}"
                           style="background-color: #2563eb; color: white; padding: 12px 24px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Issue
                        </a>
                    </div>
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>Jira Lite Team</strong>
                    </p>
                </div>
            </body>
        </html>
        """

        await self.send_email(to_email, subject, html_content)
