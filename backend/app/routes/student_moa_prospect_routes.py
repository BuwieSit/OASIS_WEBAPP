from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import os
import uuid
from werkzeug.utils import secure_filename
from sqlalchemy import func

from app.extensions import db
from app.models.moa_prospect import MoaProspect
from app.models.host_training_establishment import HostTrainingEstablishment

student_moa_prospect_bp = Blueprint(
    "student_moa_prospect",
    __name__,
    url_prefix="/api/student/moa-prospects"
)


def _normalize_company_name(value):
    return " ".join((value or "").strip().lower().split())


@student_moa_prospect_bp.route("", methods=["POST"])
@jwt_required()
def submit_moa_prospect():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    user_id = get_jwt_identity()

    company_name = (request.form.get("company_name") or "").strip()
    industry = (request.form.get("industry") or "").strip()
    address = (request.form.get("address") or "").strip()
    contact_person = (request.form.get("contact_person") or "").strip()
    contact_position = (request.form.get("contact_position") or "").strip()
    contact_email = (request.form.get("contact_email") or "").strip()
    contact_number = (request.form.get("contact_number") or "").strip()

    required_fields = {
        "company_name": company_name,
        "industry": industry,
        "address": address,
        "contact_person": contact_person,
        "contact_position": contact_position,
        "contact_email": contact_email,
        "contact_number": contact_number,
    }

    missing_fields = [key for key, value in required_fields.items() if not value]
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    normalized_company_name = _normalize_company_name(company_name)

    existing_hte = (
        HostTrainingEstablishment.query
        .filter(
            func.lower(func.trim(HostTrainingEstablishment.company_name))
            == normalized_company_name
        )
        .first()
    )

    if existing_hte:
        return jsonify({
            "error": "duplicate_hte",
            "message": f'"{company_name}" already exists as an approved HTE.',
            "duplicate_type": "APPROVED_HTE",
            "existing_record": {
                "id": existing_hte.id,
                "company_name": existing_hte.company_name,
                "moa_status": existing_hte.moa_status,
            }
        }), 409

    existing_prospect = (
        MoaProspect.query
        .filter(
            func.lower(func.trim(MoaProspect.company_name))
            == normalized_company_name,
            MoaProspect.status != "CANCELLED"
        )
        .order_by(MoaProspect.created_at.desc())
        .first()
    )

    if existing_prospect:
        return jsonify({
            "error": "duplicate_moa_prospect",
            "message": (
                f'"{company_name}" already exists as an MOA prospect '
                f'with status {existing_prospect.status}.'
            ),
            "duplicate_type": "EXISTING_MOA_PROSPECT",
            "existing_record": {
                "id": existing_prospect.id,
                "company_name": existing_prospect.company_name,
                "status": existing_prospect.status,
            }
        }), 409

    file = request.files.get("moa_file")
    saved_file_path = ""

    if file and file.filename:
        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"

        upload_dir = current_app.config["UPLOAD_MOA_FOLDER"]
        os.makedirs(upload_dir, exist_ok=True)

        absolute_file_path = os.path.join(upload_dir, unique_filename)
        file.save(absolute_file_path)

        saved_file_path = f"uploads/moa/{unique_filename}"

    try:
        prospect = MoaProspect(
            student_id=user_id,
            company_name=company_name,
            industry=industry,
            address=address,
            contact_person=contact_person,
            contact_position=contact_position,
            contact_email=contact_email,
            contact_number=contact_number,
            moa_file_path=saved_file_path,
            status="EMAILED_TO_HTE"
        )

        db.session.add(prospect)
        db.session.commit()

        return jsonify({
            "message": "MOA Prospect submitted successfully",
            "data": {
                "id": prospect.id,
                "company_name": prospect.company_name,
                "industry": prospect.industry,
                "address": prospect.address,
                "contact_person": prospect.contact_person,
                "contact_position": prospect.contact_position,
                "contact_email": prospect.contact_email,
                "contact_number": prospect.contact_number,
                "moa_file_path": prospect.moa_file_path,
                "status": prospect.status,
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Failed to submit MOA prospect")
        return jsonify({
            "error": "Failed to submit MOA prospect",
            "details": str(e)
        }), 500