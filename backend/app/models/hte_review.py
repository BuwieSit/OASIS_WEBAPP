from datetime import datetime
from app.extensions import db


class HteReview(db.Model):
    __tablename__ = "hte_reviews"

    id = db.Column(db.Integer, primary_key=True)

    hte_id = db.Column(
        db.Integer,
        db.ForeignKey("host_training_establishments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    student_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating = db.Column(db.Integer, nullable=False)  # 1..5
    criteria = db.Column(db.String(100), nullable=True)
    message = db.Column(db.Text, nullable=False)

    status = db.Column(
        db.Enum("PENDING", "APPROVED", "REJECTED", name="hte_review_status_enum"),
        nullable=False,
        default="PENDING",
        index=True,
    )

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relationships
    hte = db.relationship(
        "HostTrainingEstablishment",
        backref=db.backref("reviews", lazy=True),
    )