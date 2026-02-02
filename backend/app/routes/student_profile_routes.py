from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.user import UserRole, User
from app.models.student_profile import StudentProfile
import os
from werkzeug.utils import secure_filename
from flask import request, jsonify, current_app


student_profile_bp = Blueprint("student_profile_bp", __name__, url_prefix="/api/student")


def require_role(expected_role: str):
    claims = get_jwt()
    role = claims.get("role")
    if role != expected_role:
        return jsonify({"error": "forbidden"}), 403
    return None


@student_profile_bp.get("/me")
@jwt_required()
def get_student_me():
    denied = require_role(UserRole.STUDENT.value)
    if denied:
        return denied

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        # Safety net: auto-create if missing
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    return jsonify(
        {
            "user": user.to_public_dict(),
            "profile": profile.to_dict(),
        }
    ), 200


@student_profile_bp.patch("/me")
@jwt_required()
def update_student_me():
    denied = require_role(UserRole.STUDENT.value)
    if denied:
        return denied

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)

    data = request.get_json(silent=True) or {}

    # Allow only these fields
    if "first_name" in data:
        profile.first_name = (data["first_name"] or "").strip() or None
    if "middle_initial" in data:
        profile.middle_initial = (data["middle_initial"] or "").strip() or None
    if "last_name" in data:
        profile.last_name = (data["last_name"] or "").strip() or None

    db.session.commit()

    return jsonify(
        {
            "message": "updated",
            "profile": profile.to_dict(),
        }
    ), 200

def allowed_file(filename: str) -> bool:
    allowed = current_app.config.get(
        "ALLOWED_EXTENSIONS",
        {"png", "jpg", "jpeg", "webp"}
    )
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed
    )

@student_profile_bp.patch("/me/photo")
@jwt_required()
def upload_student_photo():
    denied = require_role(UserRole.STUDENT.value)
    if denied:
        return denied

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    if "photo" not in request.files:
        return jsonify({"error": "no file provided"}), 400

    file = request.files["photo"]

    if file.filename == "":
        return jsonify({"error": "empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "invalid file type"}), 400

    # 🔒 Overwrite strategy: always same filename per user
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"user_{user.id}.{ext}")

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)

    # Store URL path, not filesystem path
    profile.photo_path = f"/uploads/profile_photos/{filename}"
    db.session.commit()

    return jsonify({
        "message": "photo uploaded",
        "photo_path": profile.photo_path
    }), 200
