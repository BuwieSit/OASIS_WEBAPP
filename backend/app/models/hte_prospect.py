from app.extensions import db
from datetime import datetime

class HTEProspect(db.Model):
    __tablename__ = "hte_prospects"

    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(255), nullable=False)
    industry = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    moa_file_path = db.Column(db.String(255), nullable=False)

    status = db.Column(db.String(20), default="PENDING")
    submitted_by = db.Column(db.Integer, db.ForeignKey("students.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    contact_person = db.relationship(
        "HTEContactPerson",
        backref="hte_prospect",
        uselist=False,
        cascade="all, delete"
    )
