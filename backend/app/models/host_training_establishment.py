from app.extensions import db

class HostTrainingEstablishment(db.Model):
    __tablename__ = "host_training_establishments"

    id = db.Column(db.Integer, primary_key=True)

    # Company Info
    company_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(150), nullable=False)
    address = db.Column(db.Text, nullable=False)

    # Contact Person
    contact_person = db.Column(db.String(150), nullable=False)
    contact_position = db.Column(db.String(150), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)

    # MOA Info
    moa_status = db.Column(
        db.Enum("ACTIVE", "PENDING", "EXPIRED", name="moa_status_enum"),
        nullable=False,
        default="PENDING"
    )

    course = db.Column(db.String(150), nullable=True)

    moa_signed_at = db.Column(db.Date, nullable=True)
    moa_validity = db.Column(db.Integer, nullable=True)  # in months
    moa_expiry_date = db.Column(db.Date, nullable=True)

    moa_file_path = db.Column(db.String(255), nullable=True)

    thumbnail_path = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
