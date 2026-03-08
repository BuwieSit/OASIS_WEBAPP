from datetime import datetime
from app.extensions import db


class UploadedDocument(db.Model):
    __tablename__ = "uploaded_documents"

    id = db.Column(db.Integer, primary_key=True)

    # Which tab this belongs to
    section = db.Column(db.String(50), nullable=False, index=True)
    # allowed: procedures, moa, guidelines, forms

    # Item type in the content tree
    item_type = db.Column(db.String(50), nullable=False)
    # allowed: header, description, numerical_list, bulleted_list, alphabetical_list, document

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # only used for uploaded documents
    file_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)

    # nesting
    parent_id = db.Column(
        db.Integer,
        db.ForeignKey("uploaded_documents.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    # ordering inside same level
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    uploaded_by = db.Column(db.Integer, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    children = db.relationship(
        "UploadedDocument",
        backref=db.backref("parent", remote_side=[id]),
        cascade="all, delete-orphan",
        order_by="UploadedDocument.sort_order"
    )

    def to_dict(self, include_children=True):
        data = {
            "id": self.id,
            "section": self.section,
            "item_type": self.item_type,
            "title": self.title,
            "description": self.description,
            "file_path": self.file_path,
            "original_filename": self.original_filename,
            "parent_id": self.parent_id,
            "sort_order": self.sort_order,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_children:
            data["children"] = [
                child.to_dict(include_children=True)
                for child in sorted(self.children, key=lambda x: x.sort_order)
            ]

        return data