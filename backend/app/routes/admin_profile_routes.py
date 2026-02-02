from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.user import UserRole, User
from app.models.admin_profile import AdminProfile

admin_profile_bp = Blueprint("admin_profile_bp", __name__, url_prefix="/api/admin")


def require_role(expected_role: str):
    claims = get_jwt()
    role = claims.get("role")
    if role != expected_role:
        return jsonify({"error": "forbidden"}), 403
    return None


@admin_profile_bp.get("/me")
@jwt_required()
def get_admin_me():
    denied = require_role(UserRole.ADMIN.value)
    if denied:
        return denied

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    profile = AdminProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        # Safety net: auto-create if missing
        profile = AdminProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    return jsonify(
        {
            "user": user.to_public_dict(),
            "profile": profile.to_dict(),
        }
    ), 200


@admin_profile_bp.patch("/me/username")
@jwt_required()
def update_admin_username():
    denied = require_role(UserRole.ADMIN.value)
    if denied:
        return denied

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    profile = AdminProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = AdminProfile(user_id=user.id)
        db.session.add(profile)

    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()

    if not username:
        return jsonify({"error": "username is required"}), 400

    # Uniqueness check
    existing = AdminProfile.query.filter(AdminProfile.username == username, AdminProfile.user_id != user.id).first()
    if existing:
        return jsonify({"error": "username already taken"}), 409

    profile.username = username
    db.session.commit()

    return jsonify({"message": "updated", "profile": profile.to_dict()}), 200
