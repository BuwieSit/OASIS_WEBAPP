from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import func

from app.extensions import db
from app.models import HostTrainingEstablishment, StudentProfile
from app.models.hte_review import HteReview
from app.models.user import UserRole

admin_review_bp = Blueprint(
    "admin_review_bp",
    __name__,
    url_prefix="/api/admin/reviews",
)


def _admin_only():
    claims = get_jwt()
    return claims.get("role") == UserRole.ADMIN.value


def _build_query():
    status = (request.args.get("status") or "PENDING").upper()
    hte_name = (request.args.get("hte_name") or "").strip()
    criteria = (request.args.get("criteria") or "").strip()
    sort = (request.args.get("sort") or "newest").lower()
    rating = request.args.get("rating")

    q = (
        db.session.query(HteReview, HostTrainingEstablishment, StudentProfile)
        .join(HostTrainingEstablishment, HostTrainingEstablishment.id == HteReview.hte_id)
        .outerjoin(StudentProfile, StudentProfile.user_id == HteReview.student_user_id)
    )

    if status in {"PENDING", "APPROVED", "REJECTED"}:
        q = q.filter(HteReview.status == status)

    if hte_name:
        # case-insensitive contains
        q = q.filter(func.lower(HostTrainingEstablishment.company_name).contains(hte_name.lower()))

    if criteria:
        q = q.filter(HteReview.criteria == criteria)

    if rating:
        try:
            r = int(rating)
            if 1 <= r <= 5:
                q = q.filter(HteReview.rating == r)
        except Exception:
            pass

    if sort == "oldest":
        q = q.order_by(HteReview.created_at.asc())
    else:
        q = q.order_by(HteReview.created_at.desc())

    return q


@admin_review_bp.get("")
@jwt_required()
def list_reviews():
    if not _admin_only():
        return jsonify({"error": "forbidden"}), 403

    rows = _build_query().all()

    out = []
    for r, hte, sp in rows:
        reviewer = "Anonymous"
        if sp and (sp.first_name or sp.last_name):
            reviewer = f"{sp.first_name or ''} {sp.last_name or ''}".strip()

        out.append({
            "id": r.id,
            "hte_id": r.hte_id,
            "hte_name": hte.company_name,
            "student_user_id": r.student_user_id,
            "reviewer": reviewer,
            "rating": r.rating,
            "criteria": r.criteria,
            "message": r.message,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        })

    return jsonify(out), 200


@admin_review_bp.patch("/<int:review_id>/approve")
@jwt_required()
def approve_review(review_id: int):
    if not _admin_only():
        return jsonify({"error": "forbidden"}), 403

    r = HteReview.query.get(review_id)
    if not r:
        return jsonify({"error": "not found"}), 404

    r.status = "APPROVED"
    db.session.commit()
    return jsonify({"id": r.id, "status": r.status}), 200


@admin_review_bp.patch("/<int:review_id>/reject")
@jwt_required()
def reject_review(review_id: int):
    if not _admin_only():
        return jsonify({"error": "forbidden"}), 403

    r = HteReview.query.get(review_id)
    if not r:
        return jsonify({"error": "not found"}), 404

    r.status = "REJECTED"
    db.session.commit()
    return jsonify({"id": r.id, "status": r.status}), 200


@admin_review_bp.post("/approve-all")
@jwt_required()
def approve_all():
    if not _admin_only():
        return jsonify({"error": "forbidden"}), 403

    rows = _build_query().filter(HteReview.status == "PENDING").all()
    ids = [r.id for r, _, _ in rows]

    if not ids:
        return jsonify({"updated": 0}), 200

    HteReview.query.filter(HteReview.id.in_(ids)).update(
        {"status": "APPROVED"}, synchronize_session=False
    )
    db.session.commit()

    return jsonify({"updated": len(ids)}), 200


@admin_review_bp.post("/clear-all")
@jwt_required()
def clear_all_pending():
    """
    Clear ALL reviews that are NOT YET accepted:
    delete PENDING reviews in the current filter scope.
    """
    if not _admin_only():
        return jsonify({"error": "forbidden"}), 403

    rows = _build_query().filter(HteReview.status == "PENDING").all()
    ids = [r.id for r, _, _ in rows]

    if not ids:
        return jsonify({"deleted": 0}), 200

    HteReview.query.filter(HteReview.id.in_(ids)).delete(synchronize_session=False)
    db.session.commit()

    return jsonify({"deleted": len(ids)}), 200