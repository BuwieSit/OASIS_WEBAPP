import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import HostTrainingEstablishment

app = create_app()

with app.app_context():

    HostTrainingEstablishment.query.delete()
    db.session.commit()

    today = date.today()

    htes = [

        # =========================
        # ACTIVE HTE
        # =========================
        HostTrainingEstablishment(
            company_name="ABC Tech Solutions",
            industry="IT Services",
            address="Quezon City, Philippines",
            description=(
                "ABC Tech Solutions is an IT company specializing in "
                "software development, cloud services, and system integration."
            ),
            website="https://www.abctech.com",

            contact_person="Juan Dela Cruz",
            contact_position="HR Manager",
            contact_number="09171234567",
            contact_email="hr@abctech.com",

            moa_status="ACTIVE",
            course="Diploma in Information Technology",
            moa_signed_at=today - timedelta(days=180),
            moa_validity=12,
            moa_expiry_date=today + timedelta(days=180),

            moa_file_path="uploads/moa/abc_tech.pdf",
            thumbnail_path="uploads/hte_thumbnails/hte_abc.jpg",
        ),

        # =========================
        # PENDING HTE
        # =========================
        HostTrainingEstablishment(
            company_name="NovaByte Innovations",
            industry="Software Development",
            address="Taguig City, Philippines",
            description=(
                "NovaByte Innovations focuses on web and mobile application "
                "development and accepts interns for real-world projects."
            ),
            website="https://www.novabyte.io",

            contact_person="Maria Santos",
            contact_position="Talent Acquisition Lead",
            contact_number="09981234567",
            contact_email="careers@novabyte.io",

            moa_status="PENDING",
            course="BS Information Technology",
            moa_signed_at=None,
            moa_validity=None,
            moa_expiry_date=None,

            moa_file_path=None,
            thumbnail_path="uploads/hte_thumbnails/hte_novabyte.jpg",
        ),

        # =========================
        # EXPIRED HTE
        # =========================
        HostTrainingEstablishment(
            company_name="PixelWorks Studio",
            industry="Digital Media & Design",
            address="Cebu City, Philippines",
            description=(
                "PixelWorks Studio is a creative agency specializing in "
                "UI/UX design, branding, and multimedia production."
            ),
            website="https://www.pixelworks.ph",

            contact_person="Carlos Reyes",
            contact_position="Studio Director",
            contact_number="09221234567",
            contact_email="studio@pixelworks.ph",

            moa_status="EXPIRED",
            course="Multimedia Arts / IT",
            moa_signed_at=today - timedelta(days=900),
            moa_validity=12,
            moa_expiry_date=today - timedelta(days=540),

            moa_file_path="uploads/moa/pixelworks_moa.pdf",
            thumbnail_path="uploads/hte_thumbnails/hte_pixelworks.jpg",
        ),

        # =========================
        # ACTIVE (NON-IT INDUSTRY)
        # =========================
        HostTrainingEstablishment(
            company_name="GreenCore Manufacturing",
            industry="Manufacturing",
            address="Laguna, Philippines",
            description=(
                "GreenCore Manufacturing provides industrial internship "
                "opportunities focusing on IT support and systems operations."
            ),
            website="https://www.greencore.ph",

            contact_person="Anna Lim",
            contact_position="Operations Manager",
            contact_number="09199887766",
            contact_email="operations@greencore.ph",

            moa_status="ACTIVE",
            course="Information Systems",
            moa_signed_at=today - timedelta(days=90),
            moa_validity=24,
            moa_expiry_date=today + timedelta(days=630),

            moa_file_path="uploads/moa/greencore_moa.pdf",
            thumbnail_path="uploads/hte_thumbnails/hte_greencore.jpg",
        ),
    ]

    db.session.bulk_save_objects(htes)
    db.session.commit()

    print("✅ Multiple HTEs seeded successfully.")