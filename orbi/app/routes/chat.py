from flask import Blueprint, jsonify, request
from app.services.retriever import retrieve_best_answer

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

    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    user_id = data.get("user_id")
    role = data.get("role")
    message = data.get("message")

    if not user_id or not role or not message:
        return jsonify({"error": "Missing required fields"}), 400

    if role not in ["student", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    result = retrieve_best_answer(message)

    return jsonify({
        "reply": result["reply"],
        "source": result["source"],
        "section": result["section"],
        "confidence": result["confidence"]
    }), 200