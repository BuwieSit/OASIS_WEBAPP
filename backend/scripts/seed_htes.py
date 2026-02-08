import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models import HostTrainingEstablishment, MemorandumOfAgreement

app = create_app()

with app.app_context():

    # =========================
    # CLEAN TABLES
    # =========================
    MemorandumOfAgreement.query.delete()
    HostTrainingEstablishment.query.delete()
    db.session.commit()

    today = date.today()

    # =========================
    # HTEs
    # =========================
    abc = HostTrainingEstablishment(
        company_name="ABC Tech Solutions",
        industry="IT Services",
        address="Quezon City, Philippines",
        description="Software development, cloud services, system integration.",
        website="https://www.abctech.com",
        contact_person="Juan Dela Cruz",
        contact_position="HR Manager",
        contact_number="09171234567",
        contact_email="hr@abctech.com",
        thumbnail_path="uploads/hte_thumbnails/hte_abc.jpg",
    )

    nova = HostTrainingEstablishment(
        company_name="NovaByte Innovations",
        industry="Software Development",
        address="Taguig City, Philippines",
        description="Web and mobile application development.",
        website="https://www.novabyte.io",
        contact_person="Maria Santos",
        contact_position="Talent Acquisition Lead",
        contact_number="09981234567",
        contact_email="careers@novabyte.io",
        thumbnail_path="uploads/hte_thumbnails/hte_novabyte.jpg",
    )

    pixel = HostTrainingEstablishment(
        company_name="PixelWorks Studio",
        industry="Digital Media & Design",
        address="Cebu City, Philippines",
        description="UI/UX design, branding, multimedia production.",
        website="https://www.pixelworks.ph",
        contact_person="Carlos Reyes",
        contact_position="Studio Director",
        contact_number="09221234567",
        contact_email="studio@pixelworks.ph",
        thumbnail_path="uploads/hte_thumbnails/hte_pixelworks.jpg",
    )

    greencore = HostTrainingEstablishment(
        company_name="GreenCore Manufacturing",
        industry="Manufacturing",
        address="Laguna, Philippines",
        description="Industrial internships with IT support focus.",
        website="https://www.greencore.ph",
        contact_person="Anna Lim",
        contact_position="Operations Manager",
        contact_number="09199887766",
        contact_email="operations@greencore.ph",
        thumbnail_path="uploads/hte_thumbnails/hte_greencore.jpg",
    )

    db.session.add_all([abc, nova, pixel, greencore])
    db.session.commit()

    # =========================
    # MOAs (THIS IS THE KEY FIX)
    # =========================
    moas = [
        MemorandumOfAgreement(
            hte_id=abc.id,
            status="ACTIVE",
            signed_at=today - timedelta(days=180),
            expires_at=today + timedelta(days=180),
            document_path="uploads/moa/abc_tech.pdf",
        ),

        MemorandumOfAgreement(
            hte_id=pixel.id,
            status="EXPIRED",
            signed_at=today - timedelta(days=900),
            expires_at=today - timedelta(days=540),
            document_path="uploads/moa/pixelworks_moa.pdf",
        ),

        MemorandumOfAgreement(
            hte_id=greencore.id,
            status="ACTIVE",
            signed_at=today - timedelta(days=90),
            expires_at=today + timedelta(days=630),
            document_path="uploads/moa/greencore_moa.pdf",
        ),
    ]

    db.session.add_all(moas)
    db.session.commit()

    print("✅ HTEs and MOAs seeded correctly")
