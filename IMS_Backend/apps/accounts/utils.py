"""
Email utility for sending OTP.
"""

from django.conf import settings
from django.core.mail import send_mail


def send_otp_email(email: str, otp: str) -> None:
    """Send the OTP code via email."""
    subject = "CoreInventory – Password Reset OTP"
    message = (
        f"Your one-time password (OTP) for password reset is: {otp}\n\n"
        f"This code will expire in {settings.OTP_EXPIRY_MINUTES} minutes.\n\n"
        f"If you did not request this, please ignore this email."
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.EMAIL_HOST_USER or "noreply@coreinventory.com",
        recipient_list=[email],
        fail_silently=False,
    )
