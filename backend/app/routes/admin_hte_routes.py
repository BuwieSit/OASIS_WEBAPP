from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.orm import aliased
from sqlalchemy import desc

from app.extensions import db
from app.models import HostTrainingEstablishment, MemorandumOfAgreement
from app.models.user import UserRole

admin_hte_bp = Blueprint(
    "admin_hte_bp",
    __name__,
    url_prefix="/api/admin/htes"
)

@admin_hte_bp.get("")
@jwt_required()
def get_htes():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    status = request.args.get("status")

    # Subquery: latest MOA per HTE
    latest_moa = (
        db.session.query(
            MemorandumOfAgreement.hte_id,
            db.func.max(MemorandumOfAgreement.signed_at).label("latest_signed")
        )
        .group_by(MemorandumOfAgreement.hte_id)
        .subquery()
    )

    moa = aliased(MemorandumOfAgreement)

    query = (
        db.session.query(HostTrainingEstablishment, moa)
        .outerjoin(latest_moa, latest_moa.c.hte_id == HostTrainingEstablishment.id)
        .outerjoin(
            moa,
            (moa.hte_id == HostTrainingEstablishment.id) &
            (moa.signed_at == latest_moa.c.latest_signed)
        )
    )

    if status:
        query = query.filter(moa.status == status)

    rows = query.order_by(HostTrainingEstablishment.company_name).all()

    results = []
    for hte, moa in rows:
        results.append({
            "hte_id": hte.id,
            "company_name": hte.company_name,
            "industry": hte.industry,
            "location": hte.address,
            "moa": None if not moa else {
                "status": moa.status,
                "signed_at": moa.signed_at.isoformat() if moa.signed_at else None,
                "expires_at": moa.expires_at.isoformat() if moa.expires_at else None,
            }
        })

    return jsonify(results), 200
