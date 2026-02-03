from flask import Blueprint, jsonify, request

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "service": "ORBI",
        "status": "healthy",
        "message": "ORBI service is running"
    }), 200


@chat_bp.route("/orbi/chat", methods=["POST"])
def orbi_chat():
    data = request.get_json()

    # Basic validation
    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    user_id = data.get("user_id")
    role = data.get("role")
    message = data.get("message")

    if not user_id or not role or not message:
        return jsonify({"error": "Missing required fields"}), 400

    # Stub response (NO AI)
    return jsonify({
        "reply": "ORBI is ready. Chat processing will be enabled soon.",
        "source": "system",
        "confidence": 0.0
    }), 200