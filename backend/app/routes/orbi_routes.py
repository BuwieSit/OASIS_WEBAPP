from flask import Blueprint, jsonify, request
from app.models import HostTrainingEstablishment

orbi_bp = Blueprint("orbi", __name__, url_prefix="/api/orbi")


@orbi_bp.route("/htes", methods=["GET"])
def get_htes():
    course = (request.args.get("course") or "").strip().upper()
    limit = min(int(request.args.get("limit", 10)), 50)

    query = HostTrainingEstablishment.query.with_entities(
        HostTrainingEstablishment.id,
        HostTrainingEstablishment.company_name,
        HostTrainingEstablishment.industry,
        HostTrainingEstablishment.moa_status,
        HostTrainingEstablishment.moa_file_path,
        HostTrainingEstablishment.course,
    )

    if course:
        query = query.filter(HostTrainingEstablishment.course.ilike(f"%{course}%"))

    htes = (
        query.order_by(HostTrainingEstablishment.company_name.asc())
        .limit(limit)
        .all()
    )

    return jsonify([
        {
            "id": h.id,
            "company_name": h.company_name,
            "industry": h.industry,
            "moa_status": h.moa_status,
            "moa_file": h.moa_file_path,
            "course": h.course,
        }
        for h in htes
    ]), 200


@orbi_bp.route("/hte", methods=["GET"])
def get_hte():
    name = (request.args.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Missing HTE name"}), 400

    hte = (
        HostTrainingEstablishment.query.with_entities(
            HostTrainingEstablishment.id,
            HostTrainingEstablishment.company_name,
            HostTrainingEstablishment.industry,
            HostTrainingEstablishment.moa_status,
            HostTrainingEstablishment.moa_file_path,
            HostTrainingEstablishment.moa_expiry_date,
            HostTrainingEstablishment.course,
            HostTrainingEstablishment.address,
        )
        .filter(HostTrainingEstablishment.company_name.ilike(f"%{name}%"))
        .order_by(HostTrainingEstablishment.company_name.asc())
        .first()
    )

    if not hte:
        return jsonify({"error": "HTE not found"}), 404

    return jsonify({
        "id": hte.id,
        "company_name": hte.company_name,
        "industry": hte.industry,
        "moa_status": hte.moa_status,
        "moa_file": hte.moa_file_path,
        "moa_expiry_date": hte.moa_expiry_date.isoformat() if hte.moa_expiry_date else None,
        "course": hte.course,
        "address": hte.address,
    }), 200