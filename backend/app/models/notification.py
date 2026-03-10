from datetime import datetime
from app.extensions import db

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    type = db.Column(
        db.Enum(
            "ANNOUNCEMENT",
            "MOA_EXPIRY",
            "MOA_PROSPECT",
            name="notification_type_enum"
        ),
        nullable=False
    )

    reference_id = db.Column(db.Integer, nullable=True)

    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)

    is_read = db.Column(db.Boolean, default=False, nullable=False)
    is_saved = db.Column(db.Boolean, default=False, nullable=False)

    read_at = db.Column(db.DateTime, nullable=True)
    saved_at = db.Column(db.DateTime, nullable=True)
    last_interacted_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def _to_utc_iso(self, value):
        if not value:
            return None
        return value.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "reference_id": self.reference_id,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "is_saved": self.is_saved,
            "read_at": self._to_utc_iso(self.read_at),
            "saved_at": self._to_utc_iso(self.saved_at),
            "last_interacted_at": self._to_utc_iso(self.last_interacted_at),
            "created_at": self._to_utc_iso(self.created_at),
        }