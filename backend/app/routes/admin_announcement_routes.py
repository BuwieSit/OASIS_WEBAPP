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

# Frontend labels -> DB enum values
CATEGORY_LABEL_TO_ENUM = {
    "HTE Related": "HTE_RELATED",
    "Deadlines": "DEADLINES",
    "Newly Approved HTEs": "NEWLY_APPROVED_HTES",
    "Events and Webinars": "EVENTS_AND_WEBINARS",
    "Others": "OTHERS",
}

def normalize_category(raw):
    if not raw:
        return None
    raw = str(raw).strip()
    # Allow passing enum directly
    if raw in CATEGORY_LABEL_TO_ENUM.values():
        return raw
    return CATEGORY_LABEL_TO_ENUM.get(raw)

@admin_announcement_bp.post("")
@jwt_required()
def create_announcement():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403

    data = request.get_json() or {}

    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    category = normalize_category(data.get("category"))

    if not title or not content or not category:
        return jsonify({
            "error": "validation_error",
            "message": "title, content, and category are required"
        }), 400

    announcement = Announcement(
        title=title,
        content=content,
        category=category,
        created_by=get_jwt_identity()
    )

    db.session.add(announcement)
    db.session.flush()

    # notify active students (keeps your current behavior)
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

    category = normalize_category(request.args.get("category"))
    q = (request.args.get("q") or "").strip()

    query = Announcement.query.filter_by(is_active=True)

    if category:
        query = query.filter(Announcement.category == category)

    if q:
        query = query.filter(Announcement.title.ilike(f"%{q}%"))

    announcements = (
        query
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