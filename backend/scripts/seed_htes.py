import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import HostTrainingEstablishment
from datetime import date

app = create_app()

with app.app_context():
    hte = HostTrainingEstablishment(
    company_name="ABC Tech Solutions",
    industry="IT Services",
    address="Quezon City",
    contact_person="Juan Dela Cruz",
    contact_position="HR Manager",
    contact_number="09171234567",
    contact_email="hr@abctech.com",
    moa_status="ACTIVE",
    course="BSIT",
    moa_signed_at=date(2024, 3, 1),
    moa_validity=12,
    moa_expiry_date=date(2025, 3, 1),
    moa_file_path="/uploads/moa/abc_tech.pdf",
    thumbnail_path="/uploads/hte_thumbnails/hte_sample_pic.jpg"
)

    db.session.add(hte)
    db.session.commit()
