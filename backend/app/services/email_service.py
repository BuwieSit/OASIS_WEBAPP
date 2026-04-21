import smtplib
from email.message import EmailMessage
from flask import current_app


def _send_email(to_email: str, subject: str, body: str) -> None:
    if current_app.config.get("OTP_DEV_PRINT", True):
        print(f"[DEV EMAIL] To: {to_email}")
        print(f"[DEV EMAIL] Subject: {subject}")
        print(body)
        return

    mail_server = current_app.config.get("MAIL_SERVER")
    mail_port = current_app.config.get("MAIL_PORT")
    mail_use_tls = current_app.config.get("MAIL_USE_TLS", True)
    mail_username = current_app.config.get("MAIL_USERNAME")
    mail_password = current_app.config.get("MAIL_PASSWORD")
    mail_from = current_app.config.get("MAIL_FROM") or mail_username
    mail_timeout = current_app.config.get("MAIL_TIMEOUT", 30)

    if not all([mail_server, mail_port, mail_username, mail_password, mail_from]):
        raise RuntimeError("Email config incomplete. Check MAIL_* environment variables.")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = mail_from
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(mail_server, mail_port, timeout=mail_timeout) as server:
            server.ehlo()

            if mail_use_tls:
                server.starttls()
                server.ehlo()

            server.login(mail_username, mail_password)
            server.send_message(msg)

    except Exception as e:
        current_app.logger.exception("Failed to send email")
        raise RuntimeError(f"Email sending failed: {str(e)}")


def send_otp_email(email: str, code: str) -> None:
    subject = "OASIS Registration OTP"
    body = f"""Hello,

Welcome to OASIS.

Your registration OTP code is: {code}

This code will expire in 10 minutes.

If you did not request registration, you may ignore this email.

- OASIS System
"""
    _send_email(email, subject, body)


def send_reset_password_otp_email(email: str, code: str) -> None:
    subject = "OASIS Password Reset OTP"
    body = f"""Hello,

We received a request to reset your OASIS account password.

Your password reset OTP code is: {code}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email and do not share this code with anyone.

- OASIS System
"""
    _send_email(email, subject, body)