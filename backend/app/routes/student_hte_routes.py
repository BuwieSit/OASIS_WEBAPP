from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt
import os
from flask import current_app, send_from_directory
from app.models import HostTrainingEstablishment

student_hte_bp = Blueprint(
    "student_hte",
    __name__,
    url_prefix="/api/student/htes"
)

# ======================================================
# DASHBOARD (Latest HTEs)
# ======================================================
@student_hte_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def hte_dashboard():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    htes = (
        HostTrainingEstablishment.query
        .order_by(HostTrainingEstablishment.moa_signed_at.desc().nullslast())
        .limit(10)
        .all()
    )

    return jsonify([
        {
            "id": hte.id,
            "company_name": hte.company_name,
            "industry": hte.industry,
            "thumbnail": hte.thumbnail_path,
            "moa_status": hte.moa_status,
            "moa_signed_at": (
                hte.moa_signed_at.isoformat()
                if hte.moa_signed_at else None
            ),
            "moa_expiry_date": (
                hte.moa_expiry_date.isoformat()
                if hte.moa_expiry_date else None
            ),
            "course": hte.course,
        }
        for hte in htes
    ]), 200


# ======================================================
# LIST + SEARCH + FILTER
# ======================================================
@student_hte_bp.route("", methods=["GET"])
@jwt_required()
def list_htes():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    search = request.args.get("search", "").strip()
    industry = request.args.get("industry")
    course = request.args.get("course")
    location = request.args.get("location")

    query = HostTrainingEstablishment.query

    if search:
        query = query.filter(
            HostTrainingEstablishment.company_name.ilike(f"%{search}%")
        )

    if industry:
        query = query.filter(HostTrainingEstablishment.industry == industry)

    if course:
        query = query.filter(HostTrainingEstablishment.course == course)

    if location:
        query = query.filter(
            HostTrainingEstablishment.address.ilike(f"%{location}%")
        )

    htes = query.order_by(
        HostTrainingEstablishment.company_name.asc()
    ).all()

    return jsonify({
        "htes": [
            {
                "id": hte.id,
                "company_name": hte.company_name,
                "industry": hte.industry,
                "address": hte.address,
                "thumbnail": hte.thumbnail_path,
                "course": hte.course,
                "moa_status": hte.moa_status,
                "moa_expiry_date": (
                    hte.moa_expiry_date.isoformat()
                    if hte.moa_expiry_date else None
                )
            }
            for hte in htes
        ]
    }), 200


# ======================================================
# HTE DETAIL VIEW
# ======================================================
@student_hte_bp.route("/<int:hte_id>", methods=["GET"])
@jwt_required()
def get_hte_detail(hte_id):
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    hte = HostTrainingEstablishment.query.get_or_404(hte_id)

    return jsonify({
        "id": hte.id,

        # Company Info
        "company_name": hte.company_name,
        "industry": hte.industry,
        "address": hte.address,
        "description": hte.description,
        "website": hte.website,
        "thumbnail": hte.thumbnail_path,

        # Course
        "course": hte.course,

        # Contact Person
        "contact_person": hte.contact_person,
        "contact_position": hte.contact_position,
        "contact_number": hte.contact_number,
        "contact_email": hte.contact_email,

        # MOA Info
        "moa_status": hte.moa_status,
        "moa_signed_at": (
            hte.moa_signed_at.isoformat()
            if hte.moa_signed_at else None
        ),
        "moa_expiry_date": (
            hte.moa_expiry_date.isoformat()
            if hte.moa_expiry_date else None
        ),
        "moa_file_path": hte.moa_file_path
    }), 200


# ======================================================
# MOA DOWNLOAD
# ======================================================
@student_hte_bp.route("/<int:hte_id>/moa", methods=["GET"])
@jwt_required()
def download_moa(hte_id):
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    hte = HostTrainingEstablishment.query.get_or_404(hte_id)

    if not hte.moa_file_path:
        return jsonify({"error": "MOA not available"}), 404

    relative_path = hte.moa_file_path.replace("\\", "/")

    if relative_path.startswith("uploads/"):
        relative_path = relative_path[len("uploads/"):]

    directory = os.path.join(
        current_app.config["UPLOAD_ROOT"],
        os.path.dirname(relative_path)
    )
    filename = os.path.basename(relative_path)

    return send_from_directory(
        directory,
        filename,
        as_attachment=True
    )
