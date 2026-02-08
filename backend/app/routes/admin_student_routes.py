from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.memorandum_of_agreement import MemorandumOfAgreement as moa

admin_student_bp = Blueprint(
    "admin_student_bp",
    __name__,
    url_prefix="/api/admin/students"
)

def require_admin():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403
    return None


@admin_student_bp.get("")
@jwt_required()
def list_students():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    program = request.args.get("program")

    query = (
        db.session.query(User, StudentProfile)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .filter(User.role == UserRole.STUDENT)
    )

    rows = query.order_by(StudentProfile.last_name.asc()).all()

    if program:
        query = query.filter(StudentProfile.program == program)

    results = []
    for user, profile in rows:
        results.append({
            "id": user.id,
            "name": f"{profile.first_name} {profile.middle_initial or ''} {profile.last_name}".strip(),
            "email": user.email,
            "program": profile.program,
            "ojt_adviser": profile.ojt_adviser,
            "moa_signed_at": moa.moa_signed_at if moa else None,
            "moa_expiry_date": moa.moa_expiry_date if moa else None,
            "moa_status": moa.status if moa else None,
        })
    return jsonify(results), 200