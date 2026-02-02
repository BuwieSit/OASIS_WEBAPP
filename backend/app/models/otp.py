import enum
from datetime import datetime, timedelta

from app.extensions import db

class OtpPurpose(str, enum.Enum):
    REGISTER = "REGISTER"
    RESET_PASSWORD = "RESET_PASSWORD"

class OtpCode(db.Model):
    __tablename__ = "otp_codes"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(255), nullable=False, index=True)
    purpose = db.Column(db.Enum(OtpPurpose, name="otp_purpose"), nullable=False)

    # Store the OTP code as plain in DEV; later you can hash it if you want.
    code = db.Column(db.String(10), nullable=False)

    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @staticmethod
    def default_expiry(minutes: int = 10) -> datetime:
        return datetime.utcnow() + timedelta(minutes=minutes)

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at

    def is_used(self) -> bool:
        return self.used_at is not None
