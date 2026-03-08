from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile

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
    forbidden = require_admin()
    if forbidden:
        return forbidden

    program = request.args.get("program")
    status = (request.args.get("status") or "all").strip().lower()
    search = (request.args.get("search") or "").strip().lower()

    query = (
        db.session.query(User, StudentProfile)
        .join(StudentProfile, StudentProfile.user_id == User.id)
        .filter(User.role == UserRole.STUDENT)
    )

    if program:
        query = query.filter(StudentProfile.program == program)

    if status == "active":
        query = query.filter(User.is_active.is_(True))
    elif status == "archived":
        query = query.filter(User.is_active.is_(False))

    rows = query.order_by(
        StudentProfile.last_name.asc(),
        StudentProfile.first_name.asc()
    ).all()

    results = []
    for user, profile in rows:
        middle_initial = (profile.middle_initial or "").strip()
        full_name = " ".join(
            part for part in [
                profile.first_name,
                middle_initial,
                profile.last_name
            ] if part
        )

        row = {
            "id": user.id,
            "name": full_name,
            "section": getattr(profile, "section", None),
            "student_webmail": user.email,
            "program": profile.program,
            "ojt_adviser": profile.ojt_adviser,
            "is_active": user.is_active,
            "status": "registered" if user.is_active else "archived",
        }

        if search:
            searchable = " ".join([
                row["name"] or "",
                row["section"] or "",
                row["student_webmail"] or "",
                row["program"] or "",
                row["ojt_adviser"] or "",
                row["status"] or "",
            ]).lower()

            if search not in searchable:
                continue

        results.append(row)

    registered_students = [student for student in results if student["is_active"]]
    archived_students = [student for student in results if not student["is_active"]]

    return jsonify({
        "registered": registered_students,
        "archived": archived_students,
        "all": results
    }), 200


@admin_student_bp.patch("/<int:student_id>/archive")
@jwt_required()
def archive_student(student_id):
    forbidden = require_admin()
    if forbidden:
        return forbidden

    user = (
        db.session.query(User)
        .filter(
            User.id == student_id,
            User.role == UserRole.STUDENT
        )
        .first()
    )

    if not user:
        return jsonify({"error": "student not found"}), 404

    if not user.is_active:
        return jsonify({"message": "student already archived"}), 200

    user.is_active = False
    db.session.commit()

    return jsonify({
        "message": "student archived successfully",
        "id": user.id,
        "is_active": user.is_active,
        "status": "archived"
    }), 200


@admin_student_bp.patch("/<int:student_id>/unarchive")
@jwt_required()
def unarchive_student(student_id):
    forbidden = require_admin()
    if forbidden:
        return forbidden

    user = (
        db.session.query(User)
        .filter(
            User.id == student_id,
            User.role == UserRole.STUDENT
        )
        .first()
    )

    if not user:
        return jsonify({"error": "student not found"}), 404

    if user.is_active:
        return jsonify({"message": "student already active"}), 200

    user.is_active = True
    db.session.commit()

    return jsonify({
        "message": "student unarchived successfully",
        "id": user.id,
        "is_active": user.is_active,
        "status": "registered"
    }), 200