from app.extensions import db


class MoaProspect(db.Model):
    __tablename__ = "moa_prospects"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    company_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(150), nullable=False)
    address = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    website = db.Column(db.String(255), nullable=True)

    contact_person = db.Column(db.String(150), nullable=False)
    contact_position = db.Column(db.String(150), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)

    moa_file_path = db.Column(db.String(255), nullable=False)

    status = db.Column(
        db.Enum(
            "EMAILED_TO_HTE",
            "FOR_SIGNATURE",
            "ULCO",
            "RETRIEVED_FROM_ULCO",
            "APPROVED",
            "CANCELLED",
            name="moa_prospect_status_enum"
        ),
        nullable=False,
        default="EMAILED_TO_HTE"
    )

    reviewed_by = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    reviewed_at = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
