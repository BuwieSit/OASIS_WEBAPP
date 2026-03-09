from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.orm import aliased

from app.extensions import db
from app.models import MemorandumOfAgreement, HostTrainingEstablishment
from app.models.user import UserRole

admin_moa_bp = Blueprint(
    "admin_moa_bp",
    __name__,
    url_prefix="/api/admin/moas"
)


def _compute_validity_years(signed_at, expires_at):
    if not signed_at or not expires_at:
        return None

    delta_days = (expires_at - signed_at).days
    if delta_days < 0:
        return None

    return round(delta_days / 365, 2)


@admin_moa_bp.get("")
@jwt_required()
def get_moas():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    status = request.args.get("status")

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

    rows = query.order_by(HostTrainingEstablishment.company_name.asc()).all()

    results = []
    for hte, moa_row in rows:
        signed_at = moa_row.signed_at if moa_row and moa_row.signed_at else hte.moa_signed_at
        expires_at = moa_row.expires_at if moa_row and moa_row.expires_at else hte.moa_expiry_date
        validity_years = hte.moa_validity

        if signed_at and expires_at and validity_years is None:
            validity_years = _compute_validity_years(signed_at, expires_at)

        results.append({
            "id": moa_row.id if moa_row else None,
            "status": moa_row.status if moa_row else None,
            "signed_at": signed_at.isoformat() if signed_at else None,
            "expires_at": expires_at.isoformat() if expires_at else None,
            "validity_years": validity_years,
            "document_path": moa_row.document_path if moa_row else None,
            "hte": {
                "id": hte.id,
                "company_name": hte.company_name,
                "industry": hte.industry,
                "address": hte.address,
                "contact_person": hte.contact_person,
            }
        })

    return jsonify(results), 200