from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.models.user import UserRole
from app.models.announcement import Announcement

student_announcement_bp = Blueprint(
    "student_announcement_bp",
    __name__,
    url_prefix="/api/student/announcements"
)

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
    if raw in CATEGORY_LABEL_TO_ENUM.values():
        return raw
    return CATEGORY_LABEL_TO_ENUM.get(raw)

@student_announcement_bp.get("")
@jwt_required()
def list_student_announcements():
    claims = get_jwt()
    if claims.get("role") != UserRole.STUDENT.value:
        return jsonify({"error": "forbidden"}), 403

    category = normalize_category(request.args.get("category"))
    q = (request.args.get("q") or "").strip()

    query = Announcement.query.filter_by(is_active=True)

    if category:
        query = query.filter(Announcement.category == category)

    if q:
        query = query.filter(Announcement.title.ilike(f"%{q}%"))

    announcements = query.order_by(Announcement.created_at.desc()).all()
    return jsonify([a.to_dict() for a in announcements]), 200