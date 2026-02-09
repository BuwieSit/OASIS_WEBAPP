from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.extensions import db
from app.models import MemorandumOfAgreement, HostTrainingEstablishment
from app.models.user import UserRole

admin_moa_bp = Blueprint(
    "admin_moa_bp",
    __name__,
    url_prefix="/api/admin"
)

@admin_moa_bp.get("")
@jwt_required()
def get_moas():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    moas = (
        db.session.query(MemorandumOfAgreement)
        .join(HostTrainingEstablishment)
        .all()
    )

    return jsonify([
        {
            "id": moa.id,
            "status": moa.status,
            "signed_at": moa.signed_at.isoformat(),
            "expires_at": moa.expires_at.isoformat(),
            "document_path": moa.document_path, 
            "hte": {
                "company_name": moa.hte.company_name,
                "industry": moa.hte.industry,
                "address": moa.hte.address,
                "contact_person": moa.hte.contact_person,
            }
        }
        for moa in moas
    ])