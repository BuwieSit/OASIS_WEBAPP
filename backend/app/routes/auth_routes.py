from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.models.user import User, UserRole
from app.extensions import db
from app.models.user import User, UserRole
from app.models.otp import OtpPurpose
from app.services.otp_service import create_otp, verify_otp
from app.services.email_service import send_otp_email
from app.utils.security import hash_password, verify_password
from app.utils.validators import is_student_webmail, normalize_identifier

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

@auth_bp.post("/register")
def register_send_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "email is required"}), 400

    if not is_student_webmail(email):
        return jsonify({"error": "Only @iskolarngbayan.pup.edu.ph emails can register as student"}), 400

    # If user already exists and verified, block
    existing = db.session.query(User).filter(User.email == email).first()
    if existing and existing.is_verified:
        return jsonify({"error": "account already exists"}), 409

    code = create_otp(email=email, purpose=OtpPurpose.REGISTER, minutes_valid=10)
    send_otp_email(email, code)

    return jsonify({"message": "OTP sent (check backend console if dev)"}), 200

@auth_bp.post("/verify-otp")
def register_verify_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()

    if not email or not otp:
        return jsonify({"error": "email and otp are required"}), 400

    ok = verify_otp(email=email, purpose=OtpPurpose.REGISTER, code=otp)
    if not ok:
        return jsonify({"error": "invalid or expired OTP"}), 400

    # Mark a placeholder user as "otp verified but not completed" if needed:
    # We will allow completion to create/update user.
    return jsonify({"message": "OTP verified"}), 200

@auth_bp.post("/complete-registration")
def complete_registration():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not email or not password or not confirm_password:
        return jsonify({"error": "email, password, confirm_password are required"}), 400

    if not is_student_webmail(email):
        return jsonify({"error": "Only @iskolarngbayan.pup.edu.ph emails can register as student"}), 400

    if password != confirm_password:
        return jsonify({"error": "passwords do not match"}), 400

    # Require that OTP has been verified (used) recently.
    # Simplest: require a successful verify step immediately before.
    # Here we just check that there exists a USED otp record for this email+purpose.
    from app.models.otp import OtpCode  # local import to avoid cycles

    used = (
        db.session.query(OtpCode)
        .filter(
            OtpCode.email == email,
            OtpCode.purpose == OtpPurpose.REGISTER,
            OtpCode.used_at.isnot(None),
        )
        .order_by(OtpCode.used_at.desc())
        .first()
    )
    if not used:
        return jsonify({"error": "OTP not verified"}), 400

    user = db.session.query(User).filter(User.email == email).first()
    if user and user.is_verified:
        return jsonify({"error": "account already exists"}), 409

    if not user:
        user = User(
            email=email,
            password_hash=hash_password(password),
            role=UserRole.STUDENT,
            is_active=True,
            is_verified=True,
        )
        db.session.add(user)
    else:
        # update placeholder / previous unverified
        user.password_hash = hash_password(password)
        user.role = UserRole.STUDENT
        user.is_active = True
        user.is_verified = True

    db.session.commit()
    return jsonify({"message": "Account created"}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = normalize_identifier(data.get("identifier") or data.get("email") or "")
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "identifier and password are required"}), 400

    user = db.session.query(User).filter(User.email == identifier).first()
    if not user:
        return jsonify({"error": "invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "account is disabled"}), 403

    if not verify_password(password, user.password_hash):
        return jsonify({"error": "invalid credentials"}), 401

    # Students must be verified and must use PUP webmail domain
    if user.role == UserRole.STUDENT:
        if not user.is_verified:
            return jsonify({"error": "account not verified"}), 403
        if not is_student_webmail(user.email):
            return jsonify({"error": "student email must be @iskolarngbayan.pup.edu.ph"}), 403

    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={"role": user.role.value}
    )
    return jsonify({"access_token": access_token, "role": user.role.value}), 200

@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404
    return jsonify(user.to_public_dict()), 200
