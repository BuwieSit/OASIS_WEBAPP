import sys
import os
from datetime import date

# allow imports from project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import HostTrainingEstablishment

app = create_app()

with app.app_context():

    # OPTIONAL: clear existing HTEs first (safe since you asked to wipe data)
    HostTrainingEstablishment.query.delete()
    db.session.commit()

    hte = HostTrainingEstablishment(
        # Company Info
        company_name="ABC Tech Solutions",
        industry="IT Services",
        address="Quezon City, Philippines",
        description=(
            "ABC Tech Solutions is an IT services company specializing in "
            "software development, systems integration, and technical support. "
            "The company partners with academic institutions to provide hands-on "
            "training for student interns."
        ),
        website="https://www.abctech.com",

        # Contact Person
        contact_person="Juan Dela Cruz",
        contact_position="HR Manager",
        contact_number="09171234567",
        contact_email="hr@abctech.com",

        # MOA Info
        moa_status="ACTIVE",
        course="Diploma in Information Technology",
        moa_signed_at=date(2024, 3, 1),
        moa_validity=12,  # months
        moa_expiry_date=date(2025, 3, 1),

        # File paths (RELATIVE to BASE_DIR)
        moa_file_path="uploads/moa/abc_tech.pdf",
        thumbnail_path="uploads/hte_thumbnails/hte_sample_pic.jpg",
    )

    db.session.add(hte)
    db.session.commit()

    print("✅ HTE seed data inserted successfully.")