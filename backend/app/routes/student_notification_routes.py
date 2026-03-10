from datetime import datetime, timedelta

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.notification import Notification

student_notification_bp = Blueprint(
    "student_notification_bp",
    __name__,
    url_prefix="/api/student/notifications"
)

READ_VISIBILITY_DAYS = 5


def _is_student():
    claims = get_jwt()
    return claims.get("role") == "STUDENT"


@student_notification_bp.get("")
@jwt_required()
def get_notifications():
    if not _is_student():
        return jsonify({"error": "forbidden"}), 403

    user_id = get_jwt_identity()
    cutoff = datetime.utcnow() - timedelta(days=READ_VISIBILITY_DAYS)

    notifications = (
        Notification.query
        .filter(Notification.user_id == user_id)
        .filter(
            db.or_(
                Notification.is_saved.is_(True),
                Notification.is_read.is_(False),
                db.and_(
                    Notification.is_read.is_(True),
                    Notification.is_saved.is_(False),
                    Notification.last_interacted_at.isnot(None),
                    Notification.last_interacted_at >= cutoff
                )
            )
        )
        .order_by(Notification.created_at.desc())
        .all()
    )

    return jsonify([n.to_dict() for n in notifications]), 200


@student_notification_bp.patch("/<int:notification_id>/read")
@jwt_required()
def mark_notification_as_read(notification_id):
    if not _is_student():
        return jsonify({"error": "forbidden"}), 403

    user_id = get_jwt_identity()

    notification = (
        Notification.query
        .filter_by(id=notification_id, user_id=user_id)
        .first()
    )

    if not notification:
        return jsonify({"error": "notification_not_found"}), 404

    now = datetime.utcnow()

    notification.is_read = True
    notification.read_at = now
    notification.last_interacted_at = now

    db.session.commit()

    return jsonify({
        "message": "Notification marked as read",
        "notification": notification.to_dict()
    }), 200


@student_notification_bp.patch("/<int:notification_id>/save")
@jwt_required()
def toggle_notification_save(notification_id):
    if not _is_student():
        return jsonify({"error": "forbidden"}), 403

    user_id = get_jwt_identity()

    notification = (
        Notification.query
        .filter_by(id=notification_id, user_id=user_id)
        .first()
    )

    if not notification:
        return jsonify({"error": "notification_not_found"}), 404

    now = datetime.utcnow()

    notification.is_saved = not notification.is_saved

    if notification.is_saved:
        notification.saved_at = now
    else:
        notification.saved_at = None

    db.session.commit()

    return jsonify({
        "message": "Notification save status updated",
        "notification": notification.to_dict()
    }), 200