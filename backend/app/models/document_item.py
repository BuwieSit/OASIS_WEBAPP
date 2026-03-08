from datetime import datetime
from app.extensions import db


class DocumentItem(db.Model):
    __tablename__ = "document_items"

    id = db.Column(db.String(100), primary_key=True)

    # procedures | moa | guidelines | forms
    section = db.Column(db.String(50), nullable=False, index=True)

    # header | description | numerical_list | bulleted_list | alphabetical_list | document
    type = db.Column(db.String(50), nullable=False)

    # required for all items
    title = db.Column(db.Text, nullable=False)

    # optional extra text
    description = db.Column(db.Text, nullable=True)

    parent_id = db.Column(
        db.String(100),
        db.ForeignKey("document_items.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    # used for document items only
    file_path = db.Column(db.String(255), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)

    # preserve order within same parent
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )