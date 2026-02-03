from app.extensions import db

class MemorandumOfAgreement(db.Model):
    __tablename__ = "memoranda_of_agreement"

    id = db.Column(db.Integer, primary_key=True)

    hte_id = db.Column(
        db.Integer,
        db.ForeignKey("host_training_establishments.id"),
        nullable=False
    )

    signed_at = db.Column(db.Date, nullable=False)
    expires_at = db.Column(db.Date, nullable=False)

    document_path = db.Column(db.String(255), nullable=True)

    status = db.Column(
        db.Enum("ACTIVE", "PENDING", "EXPIRED", name="moa_status_enum"),
        nullable=False,
        default="PENDING"
    )

    created_at = db.Column(db.DateTime, server_default=db.func.now())
