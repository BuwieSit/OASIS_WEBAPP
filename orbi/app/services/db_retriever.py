import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
PROJECT_ROOT = BASE_DIR  # OASIS_WEBAPP
BACKEND_PATH = os.path.join(PROJECT_ROOT, "backend")

if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from backend.app.models import HostTrainingEstablishment


def get_htes_by_course(course: str):
    htes = HostTrainingEstablishment.query.filter(
        HostTrainingEstablishment.course.ilike(f"%{course}%")
    ).all()

    return [
        {
            "id": h.id,
            "company_name": h.company_name,
            "industry": h.industry,
            "moa_status": h.moa_status
        }
        for h in htes
    ]


def get_hte_status(company_name: str):
    hte = HostTrainingEstablishment.query.filter(
        HostTrainingEstablishment.company_name.ilike(f"%{company_name}%")
    ).first()

    if not hte:
        return None

    return {
        "company_name": hte.company_name,
        "moa_status": hte.moa_status,
        "expiry": hte.moa_expiry_date.isoformat() if hte.moa_expiry_date else None
    }


def get_hte_moa(company_name: str):
    hte = HostTrainingEstablishment.query.filter(
        HostTrainingEstablishment.company_name.ilike(f"%{company_name}%")
    ).first()

    if not hte or not hte.moa_file_path:
        return None

    return {
        "company_name": hte.company_name,
        "moa_file_path": hte.moa_file_path
    }