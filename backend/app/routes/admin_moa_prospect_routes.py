from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import MoaProspect
from app.models.user import UserRole

admin_moa_prospect_bp = Blueprint(
    "admin_moa_prospect_bp",
    __name__,
    url_prefix="/api/admin/moa-prospects"
)

@admin_moa_prospect_bp.get("")
@jwt_required()
def list_moa_prospects():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    prospects = (
        db.session.query(MoaProspect)
        .order_by(MoaProspect.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": p.id,
            "company_name": p.company_name,
            "industry": p.industry,
            "address": p.address,
            "contact_person": p.contact_person,
            "contact_number": p.contact_number,
            "moa_file_path": p.moa_file_path,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in prospects
    ]), 200