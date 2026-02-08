from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import date

from app.models.user import UserRole
from app.models.memorandum_of_agreement import MemorandumOfAgreement
from app.models.moa_prospect import MoaProspect
from app.models.host_training_establishment import HostTrainingEstablishment

admin_alert_bp = Blueprint(
    "admin_alert_bp",
    __name__,
    url_prefix="/api/admin/alerts"
)

@admin_alert_bp.get("")
@jwt_required()
def get_admin_alerts():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    today = date.today()
    alerts = []

    # =====================================================
    # 1. EXPIRED MOAs
    # =====================================================
    expired_moas = (
        MemorandumOfAgreement.query
        .filter(MemorandumOfAgreement.expires_at < today)
        .order_by(MemorandumOfAgreement.expires_at.asc())
        .limit(5)
        .all()
    )

    for moa in expired_moas:
        hte = HostTrainingEstablishment.query.get(moa.hte_id)
        alerts.append({
            "id": f"expired-moa-{moa.id}",
            "type": "MOA_EXPIRED",
            "title": "MOA Expired",
            "message": f"{hte.company_name if hte else 'HTE'} MOA has expired.",
            "reference_id": moa.id,
            "date": moa.expires_at.isoformat()
        })

    # =====================================================
    # 2. EXPIRING SOON (≤ 90 DAYS)
    # =====================================================
    expiring_soon = (
        MemorandumOfAgreement.query
        .filter(
            MemorandumOfAgreement.expires_at >= today,
            MemorandumOfAgreement.expires_at <= today.replace(day=today.day)  # safe base
        )
        .all()
    )

    for moa in expiring_soon:
        days_left = (moa.expires_at - today).days
        if days_left <= 90:
            hte = HostTrainingEstablishment.query.get(moa.hte_id)
            alerts.append({
                "id": f"expiring-moa-{moa.id}",
                "type": "MOA_EXPIRING",
                "title": "MOA Expiring Soon",
                "message": f"{hte.company_name if hte else 'HTE'} MOA expires in {days_left} days.",
                "reference_id": moa.id,
                "date": moa.expires_at.isoformat()
            })

    # =====================================================
    # 3. NEW MOA PROSPECT SUBMISSIONS
    # =====================================================
    prospects = (
        MoaProspect.query
        .order_by(MoaProspect.created_at.desc())
        .limit(5)
        .all()
    )

    for prospect in prospects:
        alerts.append({
            "id": f"moa-prospect-{prospect.id}",
            "type": "MOA_PROSPECT",
            "title": "New MOA Prospect",
            "message": f"MOA prospect submitted for {prospect.company_name}.",
            "reference_id": prospect.id,
            "date": prospect.created_at.isoformat()
        })

    # Sort alerts newest first
    alerts.sort(key=lambda x: x["date"], reverse=True)

    return jsonify(alerts), 200
