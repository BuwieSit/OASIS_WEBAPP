from datetime import datetime
from app.extensions import db


class UploadedDocument(db.Model):
    __tablename__ = "uploaded_documents"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)

    file_path = db.Column(db.String(255), nullable=False)

    uploaded_by = db.Column(db.Integer, nullable=True)  # admin user id
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "file_path": self.file_path,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
