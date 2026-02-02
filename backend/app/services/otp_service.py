import random
from datetime import datetime

from app.extensions import db
from app.models.otp import OtpCode, OtpPurpose

def generate_otp_code() -> str:
    return f"{random.randint(0, 999999):06d}"

def create_otp(email: str, purpose: OtpPurpose, minutes_valid: int = 10) -> str:
    # Invalidate previous unused OTPs for same email+purpose (optional)
    db.session.query(OtpCode).filter(
        OtpCode.email == email,
        OtpCode.purpose == purpose,
        OtpCode.used_at.is_(None),
    ).delete(synchronize_session=False)

    code = generate_otp_code()
    otp = OtpCode(
        email=email,
        purpose=purpose,
        code=code,
        expires_at=OtpCode.default_expiry(minutes_valid),
    )
    db.session.add(otp)
    db.session.commit()
    return code

def verify_otp(email: str, purpose: OtpPurpose, code: str) -> bool:
    otp = (
        db.session.query(OtpCode)
        .filter(
            OtpCode.email == email,
            OtpCode.purpose == purpose,
            OtpCode.used_at.is_(None),
        )
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if not otp:
        return False
    if otp.is_expired():
        return False
    if otp.code != code:
        return False

    otp.used_at = datetime.utcnow()
    db.session.commit()
    return True
