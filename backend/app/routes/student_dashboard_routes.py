from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import date

from app.models import HostTrainingEstablishment
from app.utils.moa_status import sync_moa_statuses

student_dashboard_bp = Blueprint(
    "student_dashboard",
    __name__,
    url_prefix="/api/student/dashboard"
)

@student_dashboard_bp.route("/htes", methods=["GET"])
@jwt_required()
def get_dashboard_htes():
    claims = get_jwt()

    # role check (DO NOT use get_jwt_identity)
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    today = date.today()
    sync_moa_statuses()
    
    htes = (
        HostTrainingEstablishment.query
        .order_by(HostTrainingEstablishment.created_at.desc())
        .limit(10)
        .all()
    )

    results = []

    for hte in htes:
        if hte.moa_expiry_date and hte.moa_expiry_date < today:
            status = "EXPIRED"
        elif hte.moa_expiry_date and (hte.moa_expiry_date - today).days <= 90:
            status = "EXPIRING"
        else:
            status = "ACTIVE"

        results.append({
            "id": hte.id,
            "name": hte.company_name,
            "industry": hte.industry,
            "moa_signed_at": (
                hte.moa_signed_at.isoformat()
                if hte.moa_signed_at else None
            ),
            "moa_expiry_date": (
                hte.moa_expiry_date.isoformat()
                if hte.moa_expiry_date else None
            ),
            "moa_status": status
        })

    return jsonify({"htes": results}), 200
