from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import os
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.moa_prospect import MoaProspect

student_moa_prospect_bp = Blueprint(
    "student_moa_prospect",
    __name__,
    url_prefix="/api/student/moa-prospects"
)

@student_moa_prospect_bp.route("", methods=["POST"])
@jwt_required()
def submit_moa_prospect():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    user_id = get_jwt_identity()

    file = request.files.get("moa_file")
    if not file:
        return jsonify({"error": "MOA file is required"}), 400

    filename = secure_filename(file.filename)
    upload_dir = current_app.config["UPLOAD_MOA_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    prospect = MoaProspect(
        student_id=user_id,
        company_name=request.form.get("company_name"),
        industry=request.form.get("industry"),
        address=request.form.get("address"),
        contact_person=request.form.get("contact_person"),
        contact_position=request.form.get("contact_position"),
        contact_email=request.form.get("contact_email"),
        contact_number=request.form.get("contact_number"),
        moa_file_path=f"uploads/moa/{filename}",
        status="EMAILED_TO_HTE"
    )

    db.session.add(prospect)
    db.session.commit()

    return jsonify({"message": "MOA Prospect submitted successfully"}), 201