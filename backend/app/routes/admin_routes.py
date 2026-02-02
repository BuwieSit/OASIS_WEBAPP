from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_jwt_extended import get_jwt

from app.extensions import db
from app.models.user import User, UserRole
from app.utils.security import verify_password
from app.utils.validators import normalize_identifier

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/api/admin")

@admin_bp.post("/login")
def admin_login():
    """
    Admin login uses identifier (stored in users.email) + password.
    Example identifier: admin001
    """
    data = request.get_json(silent=True) or {}
    identifier = normalize_identifier(data.get("identifier") or "")
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    user = db.session.query(User).filter(User.email == identifier).first()
    if not user or user.role != UserRole.ADMIN:
        return jsonify({"error": "invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "account is disabled"}), 403

    if not verify_password(password, user.password_hash):
        return jsonify({"error": "invalid credentials"}), 401

    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={"role": user.role.value}
    )
    return jsonify({"access_token": access_token, "role": user.role.value}), 200

@admin_bp.get("/ping")
@jwt_required()
def admin_ping():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "admin only"}), 403
    return jsonify({"status": "ok"}), 200
