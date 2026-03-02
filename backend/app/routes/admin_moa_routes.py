from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import MemorandumOfAgreement, HostTrainingEstablishment
from app.models.user import UserRole

admin_moa_bp = Blueprint(
    "admin_moa_bp",
    __name__,
    url_prefix="/api/admin/moas"
)

@admin_moa_bp.get("")
@jwt_required()
def get_moas():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    rows = (
        db.session.query(MemorandumOfAgreement, HostTrainingEstablishment)
        .join(HostTrainingEstablishment, HostTrainingEstablishment.id == MemorandumOfAgreement.hte_id)
        .all()
    )

    return jsonify([
        {
            "id": moa.id,
            "status": moa.status,
            "signed_at": moa.signed_at.isoformat() if moa.signed_at else None,
            "expires_at": moa.expires_at.isoformat() if moa.expires_at else None,
            "document_path": moa.document_path,
            "hte": {
                "hte_id": hte.id,
                "company_name": hte.company_name,
                "industry": hte.industry,
                "address": hte.address,
                "contact_person": hte.contact_person,
            }
        }
        for moa, hte in rows
    ]), 200