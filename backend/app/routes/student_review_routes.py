from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from app.extensions import db
from app.models import HostTrainingEstablishment, StudentProfile
from app.models.hte_review import HteReview
from app.models.user import UserRole

student_review_bp = Blueprint(
    "student_review_bp",
    __name__,
    url_prefix="/api/student/htes",
)


def _student_only():
    claims = get_jwt()
    return claims.get("role") == UserRole.STUDENT.value


@student_review_bp.post("/<int:hte_id>/reviews")
@jwt_required()
def submit_review(hte_id: int):
    if not _student_only():
        return jsonify({"error": "forbidden"}), 403

    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    rating = data.get("rating")
    message = (data.get("message") or "").strip()
    criteria = (data.get("criteria") or "").strip() or None

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "rating must be an integer 1-5"}), 400
    if not message:
        return jsonify({"error": "message is required"}), 400

    hte = HostTrainingEstablishment.query.get(hte_id)
    if not hte:
        return jsonify({"error": "HTE not found"}), 404

    review = HteReview(
        hte_id=hte_id,
        student_user_id=user_id,
        rating=rating,
        criteria=criteria,
        message=message,
        status="PENDING",
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({
        "id": review.id,
        "status": review.status,
        "created_at": review.created_at.isoformat(),
    }), 201


@student_review_bp.get("/<int:hte_id>/reviews")
@jwt_required(optional=True)
def list_approved_reviews(hte_id: int):
    hte = HostTrainingEstablishment.query.get(hte_id)
    if not hte:
        return jsonify({"error": "HTE not found"}), 404

    q = (
        db.session.query(HteReview, StudentProfile)
        .outerjoin(StudentProfile, StudentProfile.user_id == HteReview.student_user_id)
        .filter(HteReview.hte_id == hte_id)
        .filter(HteReview.status == "APPROVED")
        .order_by(HteReview.created_at.desc())
    )

    results = []
    for r, sp in q.all():
        reviewer = "Anonymous"
        if sp and (sp.first_name or sp.last_name):
            reviewer = f"{sp.first_name or ''} {sp.last_name or ''}".strip()

        results.append({
            "id": r.id,
            "hte_id": r.hte_id,
            "rating": r.rating,
            "criteria": r.criteria,
            "message": r.message,
            "reviewer": reviewer,
            "created_at": r.created_at.isoformat(),
        })

    return jsonify(results), 200