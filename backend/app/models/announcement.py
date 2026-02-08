from datetime import datetime
from app.extensions import db

class AnnouncementCategory(db.Enum):
    pass


class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)

    category = db.Column(
        db.Enum(
            "HTE_RELATED",
            "DEADLINES",
            "NEWLY_APPROVED_HTES",
            "EVENTS_AND_WEBINARS",
            "OTHERS",
            name="announcement_category_enum"
        ),
        nullable=False
    )

    created_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    is_active = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "created_by": self.created_by,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
