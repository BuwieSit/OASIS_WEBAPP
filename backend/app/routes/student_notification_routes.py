from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.models.notification import Notification

student_notification_bp = Blueprint(
    "student_notification_bp",
    __name__,
    url_prefix="/api/student/notifications"
)

@student_notification_bp.get("")
@jwt_required()
def get_notifications():
    claims = get_jwt()
    if claims.get("role") != "STUDENT":
        return jsonify({"error": "forbidden"}), 403

    user_id = get_jwt_identity()

    notifications = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return jsonify([n.to_dict() for n in notifications]), 200
