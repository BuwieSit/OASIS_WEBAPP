from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import func
from datetime import date, datetime

from app.extensions import db
from app.models import (
    User,
    MemorandumOfAgreement,
    MoaProspect,
    HostTrainingEstablishment,
    UploadedDocument,
)

from app.models.user import UserRole
from app.models.student_profile import StudentProfile

admin_dashboard_bp = Blueprint(
    "admin_dashboard_bp",
    __name__,
    url_prefix="/api/admin/dashboard"
)

@admin_dashboard_bp.get("")
@jwt_required()
def get_admin_dashboard():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    today = date.today()

    # =========================
    # TOTAL REGISTERED STUDENTS
    # =========================
    total_students = (
        db.session.query(User)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .filter(User.role == UserRole.STUDENT)
        .count()
    )

    # =========================
    # MOA COUNTS
    # =========================
    total_active_moas = (
        db.session.query(MemorandumOfAgreement)
        .filter(
            MemorandumOfAgreement.expires_at.isnot(None),
            MemorandumOfAgreement.expires_at >= today
        )
        .count()
    )

    total_expired_moas = (
        db.session.query(MemorandumOfAgreement)
        .filter(
            MemorandumOfAgreement.expires_at.isnot(None),
            MemorandumOfAgreement.expires_at < today
        )
        .count()
    )

    # =========================
    # MOA PROSPECTS
    # =========================
    total_moa_prospects = db.session.query(MoaProspect).count()

    # =========================
    # HTEs
    # =========================
    total_htes = db.session.query(HostTrainingEstablishment).count()

    # =========================
    # UPLOADED DOCUMENTS
    # =========================
    total_uploaded_documents = db.session.query(UploadedDocument).count()

    return jsonify({
        "metrics": {
            "total_students": total_students,
            "total_active_moas": total_active_moas,
            "total_expired_moas": total_expired_moas,
            "total_moa_prospects": total_moa_prospects,
            "total_htes": total_htes,
            "total_uploaded_documents": total_uploaded_documents,
        },
        "last_updated": datetime.utcnow().isoformat()
    }), 200