from flask import Blueprint, jsonify, request
from app.services.retriever import retrieve_best_answer

chat_bp = Blueprint("chat", __name__)


def build_follow_ups(section: str, role: str) -> list[str]:
    section_normalized = (section or "").lower()

    if "soft copy" in section_normalized:
        return [
            "What should I include in the hard copy?",
            "What filename format should I use?",
            "What documents are required in the portfolio?"
        ]

    if "hard copy" in section_normalized:
        return [
            "What folder color should I use for my department?",
            "What should be included in the soft copy?",
            "What are the full OJT portfolio requirements?"
        ]

    if "before internship" in section_normalized:
        return [
            "What should I do during internship?",
            "What documents do I need before internship?",
            "What happens after internship?"
        ]

    if "during internship" in section_normalized:
        return [
            "What reports do I need to submit?",
            "What should I do after internship?",
            "What if I have an issue during OJT?"
        ]

    if "after internship" in section_normalized:
        return [
            "What should be included in my portfolio?",
            "What happens in final evaluation?",
            "What are the soft copy requirements?"
        ]

    if "moa" in section_normalized:
        return [
            "What is the next MOA step?",
            "What documents are needed for OJT?",
            "What should I do before internship?"
        ]

    if role == "admin":
        return [
            "What is the MOA process?",
            "What are the student portfolio requirements?",
            "What happens after internship?"
        ]

    return [
        "What are the OJT portfolio requirements?",
        "What should I do before internship?",
        "How does the MOA process work?"
    ]


def build_short_reply(reply: str) -> str:
    if not reply:
        return "I couldn’t find a clear answer yet."

    cleaned = " ".join(reply.strip().split())
    if len(cleaned) <= 160:
        return cleaned

    short = cleaned[:157].rstrip()
    if " " in short:
        short = short.rsplit(" ", 1)[0]

    return short + "..."


def sanitize_history(history) -> list[dict]:
    if not isinstance(history, list):
        return []

    cleaned_history = []

    for item in history[:12]:
        if not isinstance(item, dict):
            continue

        role = str(item.get("role", "")).strip().lower()
        text = str(item.get("text", "")).strip()

        if role not in ["user", "orbi"] or not text:
            continue

        cleaned_history.append({
            "role": role,
            "text": text
        })

    return cleaned_history


@chat_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "service": "ORBI",
        "status": "healthy",
        "message": "ORBI service is running"
    }), 200


@chat_bp.route("/orbi/chat", methods=["POST"])
def orbi_chat():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Invalid request format"}), 400

    user_id = str(data.get("user_id", "")).strip()
    role = str(data.get("role", "")).strip().lower()
    message = str(data.get("message", "")).strip()
    history = sanitize_history(data.get("history", []))

    if not user_id or not role or not message:
        return jsonify({"error": "Missing required fields"}), 400

    if role not in ["student", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    result = retrieve_best_answer(message, history=history)

    reply = result.get("reply", "")
    section = result.get("section", "General")
    source = result.get("source", "knowledge_base")
    confidence = result.get("confidence", 0.0)
    resolved_question = result.get("resolved_question", message)

    return jsonify({
        "reply": reply,
        "short_reply": build_short_reply(reply),
        "source": source,
        "section": section,
        "confidence": confidence,
        "meta": {
            "user_id": user_id,
            "role": role,
            "question": message,
            "resolved_question": resolved_question,
            "history_count": len(history)
        },
        "follow_ups": build_follow_ups(section, role)
    }), 200