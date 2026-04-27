from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.orm import aliased
import io
import os

from app.extensions import db
from app.models import HostTrainingEstablishment, MemorandumOfAgreement


student_hte_bp = Blueprint(
    "student_hte",
    __name__,
    url_prefix="/api/student/htes"
)


def _compute_status(expires_at, fallback_status=None):
    from datetime import date, timedelta

    today = date.today()

    if not expires_at:
        return "Not Available"

    if expires_at < today:
        return "EXPIRED"

    # if expiry is within 30 days → show EXPIRING
    if expires_at <= today + timedelta(days=30):
        return "EXPIRING"

    # replace old PENDING with EXPIRING
    if fallback_status == "PENDING":
        return "EXPIRING"

    return fallback_status or "ACTIVE"


def _latest_moa_query():
    latest_moa = (
        db.session.query(
            MemorandumOfAgreement.hte_id,
            db.func.max(MemorandumOfAgreement.signed_at).label("latest_signed")
        )
        .group_by(MemorandumOfAgreement.hte_id)
        .subquery()
    )

    moa = aliased(MemorandumOfAgreement)

    return latest_moa, moa


def _serialize_hte(hte, moa_row=None, include_detail=False):
    signed_at = moa_row.signed_at if moa_row and moa_row.signed_at else hte.moa_signed_at
    expires_at = moa_row.expires_at if moa_row and moa_row.expires_at else hte.moa_expiry_date

    status = (
        _compute_status(expires_at, moa_row.status)
        if moa_row
        else _compute_status(expires_at, hte.moa_status)
    )

    has_moa_file = bool(
        (moa_row and (moa_row.document_blob or moa_row.document_path))
        or hte.moa_file_path
    )

    data = {
        "id": hte.id,
        "company_name": hte.company_name,
        "industry": hte.industry,
        "thumbnail": hte.thumbnail_path,
        "course": hte.course,

        "moa_status": status,
        "moa_signed_at": signed_at.isoformat() if signed_at else None,
        "moa_expiry_date": expires_at.isoformat() if expires_at else None,

        "moa_id": moa_row.id if moa_row else None,
        "moa_file_path": hte.moa_file_path,
        "has_moa_file": has_moa_file,
    }

    if include_detail:
        data.update({
            "address": hte.address,
            "description": hte.description,
            "website": hte.website,
            "contact_person": hte.contact_person,
            "contact_position": hte.contact_position,
            "contact_number": hte.contact_number,
            "contact_email": hte.contact_email,
        })

    return data


# ======================================================
# DASHBOARD — Latest HTEs with latest accurate MOA data
# ======================================================
@student_hte_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def hte_dashboard():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    latest_moa, moa = _latest_moa_query()

    rows = (
        db.session.query(HostTrainingEstablishment, moa)
        .outerjoin(latest_moa, latest_moa.c.hte_id == HostTrainingEstablishment.id)
        .outerjoin(
            moa,
            (moa.hte_id == HostTrainingEstablishment.id)
            & (moa.signed_at == latest_moa.c.latest_signed)
        )
        .order_by(db.func.coalesce(moa.signed_at, HostTrainingEstablishment.moa_signed_at).desc().nullslast())
        .limit(10)
        .all()
    )

    return jsonify([
        _serialize_hte(hte, moa_row)
        for hte, moa_row in rows
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

    latest_moa, moa = _latest_moa_query()

    query = (
        db.session.query(HostTrainingEstablishment, moa)
        .outerjoin(latest_moa, latest_moa.c.hte_id == HostTrainingEstablishment.id)
        .outerjoin(
            moa,
            (moa.hte_id == HostTrainingEstablishment.id)
            & (moa.signed_at == latest_moa.c.latest_signed)
        )
    )

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

    rows = query.order_by(HostTrainingEstablishment.company_name.asc()).all()

    return jsonify({
        "htes": [
            _serialize_hte(hte, moa_row, include_detail=True)
            for hte, moa_row in rows
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

    latest_moa, moa = _latest_moa_query()

    row = (
        db.session.query(HostTrainingEstablishment, moa)
        .outerjoin(latest_moa, latest_moa.c.hte_id == HostTrainingEstablishment.id)
        .outerjoin(
            moa,
            (moa.hte_id == HostTrainingEstablishment.id)
            & (moa.signed_at == latest_moa.c.latest_signed)
        )
        .filter(HostTrainingEstablishment.id == hte_id)
        .first()
    )

    if not row:
        return jsonify({"error": "HTE not found"}), 404

    hte, moa_row = row

    return jsonify(_serialize_hte(hte, moa_row, include_detail=True)), 200


# ======================================================
# MOA VIEW / DOWNLOAD
# ======================================================
@student_hte_bp.route("/<int:hte_id>/moa", methods=["GET"])
@jwt_required()
def download_moa(hte_id):
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "Unauthorized"}), 403

    latest_moa = (
        MemorandumOfAgreement.query
        .filter(MemorandumOfAgreement.hte_id == hte_id)
        .order_by(MemorandumOfAgreement.signed_at.desc())
        .first()
    )

    should_download = request.args.get("download") == "1"

    if latest_moa and latest_moa.document_blob:
        filename = latest_moa.document_filename or f"HTE_{hte_id}_MOA.pdf"
        mime_type = latest_moa.document_mime_type or "application/pdf"

        return send_file(
            io.BytesIO(latest_moa.document_blob),
            mimetype=mime_type,
            as_attachment=should_download,
            download_name=filename,
            max_age=0
        )

    hte = HostTrainingEstablishment.query.get_or_404(hte_id)

    if not hte.moa_file_path:
        return jsonify({"error": "MOA not available"}), 404

    from flask import current_app, send_from_directory

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
        as_attachment=should_download
    )