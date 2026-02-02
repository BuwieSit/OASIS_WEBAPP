from datetime import datetime
from app.extensions import db


class AdminProfile(db.Model):
    __tablename__ = "admin_profiles"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Admin “identifier” for login/routing (recommended)
    username = db.Column(db.String(100), nullable=True, unique=True, index=True)

    admin_id = db.Column(db.String(100), nullable=True)
    admin_number = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = db.relationship("User", backref=db.backref("admin_profile", uselist=False))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.username,
            "admin_id": self.admin_id,
            "admin_number": self.admin_number,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
