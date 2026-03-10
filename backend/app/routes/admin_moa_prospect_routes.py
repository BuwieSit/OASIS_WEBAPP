from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime, date

from app.extensions import db
from app.models import MoaProspect, HostTrainingEstablishment, MemorandumOfAgreement
from app.models.notification import Notification
from app.models.user import UserRole

admin_moa_prospect_bp = Blueprint(
    "admin_moa_prospect_bp",
    __name__,
    url_prefix="/api/admin/moa-prospects"
)


def _ensure_admin():
    claims = get_jwt()
    if claims.get("role") != UserRole.ADMIN.value:
        return jsonify({"error": "forbidden"}), 403
    return None


def _compute_expiry_date_from_months(signed_at, validity_months):
    if not signed_at or validity_months is None:
        return None

    try:
        validity_months = int(float(validity_months))
    except Exception:
        return None

    if validity_months < 0:
        return None

    year = signed_at.year
    month = signed_at.month + validity_months

    year += (month - 1) // 12
    month = ((month - 1) % 12) + 1

    day = min(signed_at.day, 28)
    return date(year, month, day)


def _find_existing_hte(prospect):
    company_name = (prospect.company_name or "").strip().lower()

    return (
        HostTrainingEstablishment.query
        .filter(db.func.lower(HostTrainingEstablishment.company_name) == company_name)
        .first()
    )


def _create_status_notification(prospect, status):
    if not prospect.student_id:
        raise ValueError("MOA prospect has no student_id")

    readable_status = "REJECTED" if status == "CANCELLED" else status

    title = f"MOA Prospect Status Updated: {readable_status}"

    if status == "EMAILED_TO_HTE":
        message = f"Your MOA prospect for {prospect.company_name} is now marked as EMAILED TO HTE."
    elif status == "FOR_SIGNATURE":
        message = f"Your MOA prospect for {prospect.company_name} is now FOR SIGNATURE."
    elif status == "ULCO":
        message = f"Your MOA prospect for {prospect.company_name} is now under ULCO processing."
    elif status == "RETRIEVED_FROM_ULCO":
        message = f"Your MOA prospect for {prospect.company_name} has been RETRIEVED FROM ULCO."
    elif status == "APPROVED":
        message = (
            f"Good news! Your MOA prospect for {prospect.company_name} "
            f"has been APPROVED and added to the official HTE records."
        )
    elif status == "CANCELLED":
        message = f"Your MOA prospect for {prospect.company_name} has been CANCELLED."
    else:
        message = f"Your MOA prospect for {prospect.company_name} has been updated to {readable_status}."

    notification = Notification(
        user_id=int(prospect.student_id),
        type="MOA_PROSPECT",
        reference_id=prospect.id,
        title=title,
        message=message,
        is_read=False
    )

    db.session.add(notification)
    db.session.flush()

    current_app.logger.info(
        "MOA prospect notification created | prospect_id=%s | student_id=%s | status=%s | notification_id=%s",
        prospect.id,
        prospect.student_id,
        status,
        notification.id
    )

    return notification


def _approve_and_create_hte(prospect, admin_user_id):
    existing_hte = _find_existing_hte(prospect)

    if existing_hte:
        return jsonify({
            "error": "HTE already exists",
            "message": f"{prospect.company_name} already exists in Host Training Establishments.",
            "hte_id": existing_hte.id
        }), 400

    signed_at = datetime.utcnow().date()
    validity_months = 12
    expires_at = _compute_expiry_date_from_months(signed_at, validity_months)
    validity_years = round(validity_months / 12, 2)

    hte = HostTrainingEstablishment(
        company_name=prospect.company_name,
        industry=prospect.industry,
        address=prospect.address,
        description=getattr(prospect, "description", None),
        website=getattr(prospect, "website", None),
        contact_person=prospect.contact_person,
        contact_position=prospect.contact_position,
        contact_number=prospect.contact_number,
        contact_email=prospect.contact_email,
        moa_status="ACTIVE",
        course=None,
        moa_signed_at=signed_at,
        moa_validity=validity_years,
        moa_expiry_date=expires_at,
        moa_file_path=prospect.moa_file_path or None,
        thumbnail_path=None,
        logo_path=None,
    )

    db.session.add(hte)
    db.session.flush()

    moa = MemorandumOfAgreement(
        hte_id=hte.id,
        signed_at=signed_at,
        expires_at=expires_at,
        status="ACTIVE",
        document_path=prospect.moa_file_path or None
    )
    db.session.add(moa)
    db.session.flush()

    prospect.status = "APPROVED"
    prospect.reviewed_by = admin_user_id
    prospect.reviewed_at = datetime.utcnow()
    db.session.flush()

    _create_status_notification(prospect, "APPROVED")

    return {
        "hte_id": hte.id,
        "moa_id": moa.id,
        "hte_company_name": hte.company_name,
        "hte_moa_status": hte.moa_status,
        "moa_status": moa.status,
        "signed_at": signed_at.isoformat() if signed_at else None,
        "expires_at": expires_at.isoformat() if expires_at else None,
    }


@admin_moa_prospect_bp.get("")
@jwt_required()
def list_moa_prospects():
    auth_error = _ensure_admin()
    if auth_error:
        return auth_error

    prospects = (
        db.session.query(MoaProspect)
        .order_by(MoaProspect.created_at.desc())
        .all()
    )

    return jsonify([
        {
            "id": p.id,
            "student_id": p.student_id,
            "company_name": p.company_name,
            "industry": p.industry,
            "address": p.address,
            "contact_person": p.contact_person,
            "contact_position": p.contact_position,
            "contact_email": p.contact_email,
            "contact_number": p.contact_number,
            "moa_file_path": p.moa_file_path,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in prospects
    ]), 200


@admin_moa_prospect_bp.patch("/<int:prospect_id>/status")
@jwt_required()
def update_moa_prospect_status(prospect_id):
    auth_error = _ensure_admin()
    if auth_error:
        return auth_error

    admin_user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip().upper()

    allowed_statuses = {
        "EMAILED_TO_HTE",
        "FOR_SIGNATURE",
        "ULCO",
        "RETRIEVED_FROM_ULCO",
        "APPROVED",
        "CANCELLED",
    }

    if new_status not in allowed_statuses:
        return jsonify({
            "error": "Invalid status",
            "allowed_statuses": sorted(list(allowed_statuses))
        }), 400

    prospect = db.session.get(MoaProspect, prospect_id)
    if not prospect:
        return jsonify({"error": "MOA prospect not found"}), 404

    if prospect.status in {"APPROVED", "CANCELLED"}:
        return jsonify({
            "error": "Finalized prospect",
            "message": "This MOA prospect is already finalized and can no longer be updated."
        }), 400

    try:
        extra_data = None

        if new_status == "APPROVED":
            result = _approve_and_create_hte(prospect, admin_user_id)
            if isinstance(result, tuple):
                db.session.rollback()
                return result
            extra_data = result
        else:
            prospect.status = new_status
            prospect.reviewed_by = admin_user_id
            prospect.reviewed_at = datetime.utcnow()
            db.session.flush()

            _create_status_notification(prospect, new_status)

        db.session.commit()

        return jsonify({
            "message": "MOA prospect status updated successfully",
            "data": {
                "id": prospect.id,
                "status": prospect.status,
                "reviewed_by": prospect.reviewed_by,
                "reviewed_at": prospect.reviewed_at.isoformat() if prospect.reviewed_at else None,
                "extra": extra_data
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Failed to update MOA prospect status")
        return jsonify({
            "error": "Failed to update MOA prospect status",
            "details": str(e)
        }), 500