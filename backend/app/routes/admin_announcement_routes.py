from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.announcement import Announcement
from app.models.notification import Notification
from app.models.user import User, UserRole

admin_announcement_bp = Blueprint(
    "admin_announcement_bp",
    __name__,
    url_prefix="/api/admin/announcements"
)

@admin_announcement_bp.post("")
@jwt_required()
def create_announcement():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}

    announcement = Announcement(
        title=data["title"],
        content=data["content"],
        category=data["category"],
        created_by=get_jwt_identity()
    )

    db.session.add(announcement)
    db.session.flush()

    students = User.query.filter(
        User.role == UserRole.STUDENT,
        User.is_active.is_(True)
    ).all()

    for student in students:
        notif = Notification(
            user_id=student.id,
            type="ANNOUNCEMENT",
            reference_id=announcement.id,
            title=announcement.title,
            message=announcement.content
        )
        db.session.add(notif)

    db.session.commit()

    return jsonify(announcement.to_dict()), 201


@admin_announcement_bp.get("")
@jwt_required()
def list_announcements():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    announcements = (
        Announcement.query
        .filter_by(is_active=True)
        .order_by(Announcement.created_at.desc())
        .all()
    )

    return jsonify([a.to_dict() for a in announcements]), 200


@admin_announcement_bp.delete("/<int:announcement_id>")
@jwt_required()
def delete_announcement(announcement_id):
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    announcement = Announcement.query.get_or_404(announcement_id)
    announcement.is_active = False

    db.session.commit()
    return jsonify({"message": "deleted"}), 200
