from flask import current_app

def send_otp_email(email: str, code: str) -> None:
    """
    DEV mode: print OTP to console.
    Production: replace this function with SMTP/SendGrid/etc.
    """
    if current_app.config.get("OTP_DEV_PRINT", True):
        print(f"[DEV OTP] Email: {email} | OTP: {code}")
        return

    # If you later implement real email sending, do it here.
    raise NotImplementedError("Email sending not configured. Set OTP_DEV_PRINT=1 for dev.")
