import json
import re
from pathlib import Path
from typing import Dict, List, Tuple


BASE_DIR = Path(__file__).resolve().parents[2]
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"


STOPWORDS = {
    "what", "is", "are", "the", "a", "an", "for", "of", "to", "in", "on", "at",
    "and", "or", "my", "i", "me", "do", "does", "how", "when", "where", "which",
    "can", "could", "should", "would", "please", "tell", "about"
}

INTENT_KEYWORDS = {
    "soft_copy": [
        "soft copy", "pdf", "filename", "file format", "digital copy"
    ],
    "hard_copy": [
        "hard copy", "folder", "legal bond paper", "transparent cover", "color"
    ],
    "portfolio": [
        "portfolio", "requirements", "checklist", "documents", "ojt portfolio"
    ],
    "before_internship": [
        "before internship", "before ojt", "pre internship", "pre-internship", "intent letter", "enroll"
    ],
    "during_internship": [
        "during internship", "during ojt", "consultation", "monitoring", "hte orientation", "reports"
    ],
    "after_internship": [
        "after internship", "after ojt", "after my internship", "post ojt", "final evaluation", "grade computation"
    ],
    "moa_process": [
        "moa", "agreement", "legal approval", "notarized", "notarization", "signature", "retrieval"
    ],
    "department_color": [
        "folder color", "department color", "purple", "blue", "yellow", "black"
    ]
}

SECTION_PRIORITY_HINTS = {
    "Soft Copy Requirements": ["soft copy", "pdf", "filename", "digital"],
    "Hard Copy Requirements": ["hard copy", "folder", "paper", "transparent", "color"],
    "General Reminders": ["reminder", "general", "professionalism", "complete", "accurate"],
    "Before Internship": ["before", "pre internship", "orientation", "intent letter", "enroll"],
    "During Internship": ["during", "consultation", "monitoring", "hte orientation", "report issues"],
    "After Internship": ["after", "portfolio", "feedback", "final evaluation", "grade"],
    "MOA Steps": ["moa", "legal", "approval", "signature", "retrieval", "notarization"]
}


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> List[str]:
    return [
        word for word in normalize_text(text).split()
        if len(word) > 1 and word not in STOPWORDS
    ]


def clean_response_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def split_markdown_sections(content: str, source_name: str) -> List[Dict]:
    sections = []
    lines = content.splitlines()

    current_title = "General Information"
    current_body: List[str] = []

    def save_section():
        body = "\n".join(current_body).strip()
        if body:
            sections.append({
                "source": source_name,
                "section": current_title,
                "text": clean_response_text(body)
            })

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("#"):
            save_section()
            current_title = stripped.lstrip("#").strip() or "General Information"
            current_body = []
        else:
            current_body.append(line)

    save_section()

    if sections:
        return sections

    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    for i, paragraph in enumerate(paragraphs, start=1):
        sections.append({
            "source": source_name,
            "section": f"Section {i}",
            "text": clean_response_text(paragraph)
        })

    return sections


def flatten_json(data, parent_key="") -> List[Dict]:
    chunks = []

    if isinstance(data, dict):
        for key, value in data.items():
            new_key = f"{parent_key} > {key}" if parent_key else str(key)
            chunks.extend(flatten_json(value, new_key))
    elif isinstance(data, list):
        for index, item in enumerate(data, start=1):
            new_key = f"{parent_key} > Item {index}" if parent_key else f"Item {index}"
            chunks.extend(flatten_json(item, new_key))
    else:
        text = str(data).strip()
        if text:
            chunks.append({
                "source": "ojt_status_definitions.json",
                "section": parent_key or "JSON Data",
                "text": text
            })

    return chunks


def load_knowledge_base() -> List[Dict]:
    chunks: List[Dict] = []

    if not KNOWLEDGE_BASE_DIR.exists():
        return chunks

    for file_path in KNOWLEDGE_BASE_DIR.iterdir():
        if not file_path.is_file():
            continue

        suffix = file_path.suffix.lower()

        try:
            if suffix == ".md":
                content = file_path.read_text(encoding="utf-8").strip()
                if content:
                    chunks.extend(split_markdown_sections(content, file_path.name))

            elif suffix == ".json":
                raw = file_path.read_text(encoding="utf-8").strip()
                if raw:
                    parsed = json.loads(raw)
                    json_chunks = flatten_json(parsed)
                    for chunk in json_chunks:
                        chunk["source"] = file_path.name
                    chunks.extend(json_chunks)

        except Exception:
            continue

    return chunks


def detect_intents(message: str) -> List[str]:
    normalized = normalize_text(message)
    found = []

    for intent, phrases in INTENT_KEYWORDS.items():
        for phrase in phrases:
            if normalize_text(phrase) in normalized:
                found.append(intent)
                break

    if not found:
        if "before" in normalized and "internship" in normalized:
            found.append("before_internship")
        if "during" in normalized and "internship" in normalized:
            found.append("during_internship")
        if "after" in normalized and "internship" in normalized:
            found.append("after_internship")
        if "moa" in normalized:
            found.append("moa_process")
        if "portfolio" in normalized or "requirement" in normalized:
            found.append("portfolio")

    return found


def section_priority_score(message: str, section_name: str) -> float:
    normalized_message = normalize_text(message)
    score = 0.0

    for section, hints in SECTION_PRIORITY_HINTS.items():
        if section.lower() == section_name.lower():
            for hint in hints:
                if normalize_text(hint) in normalized_message:
                    score += 2.0

    return score


def score_chunk(message: str, chunk: Dict) -> float:
    message_tokens = set(tokenize(message))
    section_name = chunk.get("section", "")
    chunk_text = chunk.get("text", "")
    chunk_tokens = set(tokenize(section_name + " " + chunk_text))

    if not chunk_tokens:
        return 0.0

    overlap_score = len(message_tokens.intersection(chunk_tokens))

    normalized_message = normalize_text(message)
    normalized_section = normalize_text(section_name)
    normalized_text = normalize_text(chunk_text)

    phrase_bonus = 0.0
    if normalized_message and normalized_message in normalized_text:
        phrase_bonus += 3.0

    section_bonus = 0.0
    if normalized_message and normalized_message in normalized_section:
        section_bonus += 3.0

    title_overlap = len(set(tokenize(section_name)).intersection(message_tokens)) * 2.0
    priority_bonus = section_priority_score(message, section_name)

    intent_bonus = 0.0
    intents = detect_intents(message)

    if "soft_copy" in intents and "soft copy" in normalized_section:
        intent_bonus += 5.0
    if "hard_copy" in intents and "hard copy" in normalized_section:
        intent_bonus += 5.0
    if "before_internship" in intents and "before internship" in normalized_section:
        intent_bonus += 5.0
    if "during_internship" in intents and "during internship" in normalized_section:
        intent_bonus += 5.0
    if "after_internship" in intents and "after internship" in normalized_section:
        intent_bonus += 5.0
    if "moa_process" in intents and ("moa" in normalized_section or "moa" in normalized_text):
        intent_bonus += 5.0
    if "department_color" in intents and ("color" in normalized_text or "folder" in normalized_text):
        intent_bonus += 4.0
    if "portfolio" in intents and ("portfolio" in normalized_text or "requirements" in normalized_section):
        intent_bonus += 3.0

    return float(overlap_score + phrase_bonus + section_bonus + title_overlap + priority_bonus + intent_bonus)


def choose_top_chunks(message: str, chunks: List[Dict], top_n: int = 2) -> List[Tuple[float, Dict]]:
    scored = [(score_chunk(message, chunk), chunk) for chunk in chunks]
    scored.sort(key=lambda item: item[0], reverse=True)
    return scored[:top_n]


def format_bullets_from_text(text: str) -> List[str]:
    bullets = []
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for line in lines:
        cleaned = re.sub(r"^[-•]\s*", "", line).strip()
        cleaned = re.sub(r"^\d+\.\s*", "", cleaned).strip()

        if cleaned and cleaned not in bullets:
            bullets.append(cleaned)

    return bullets


def make_student_friendly_reply(message: str, best_chunk: Dict, support_chunk: Dict = None) -> str:
    section = best_chunk.get("section", "")
    text = best_chunk.get("text", "")
    bullets = format_bullets_from_text(text)
    normalized_message = normalize_text(message)
    intents = detect_intents(message)

    if "soft_copy" in intents:
        intro = "For the soft copy of your OJT portfolio, here’s what you need to remember:"
    elif "hard_copy" in intents:
        intro = "For the hard copy of your OJT portfolio, here are the important requirements:"
    elif "before_internship" in intents:
        intro = "Before starting your internship, you should complete these steps:"
    elif "during_internship" in intents:
        intro = "While you are already in your internship, these are the things you need to do:"
    elif "after_internship" in intents:
        intro = "After your internship, these are the next requirements and steps:"
    elif "moa_process" in intents:
        intro = "If the HTE does not yet have an existing MOA, this is the usual process:"
    elif "department_color" in intents:
        intro = "The folder color depends on your department:"
    elif "portfolio" in intents:
        intro = "For your OJT portfolio, these are the key requirements to prepare:"
    else:
        intro = f"Based on the {section.lower()}, here’s the most relevant answer for your question:"

    if bullets:
        limited = bullets[:8]
        reply = intro + "\n\n" + "\n".join([f"• {item}" for item in limited])
    else:
        reply = intro + "\n\n" + text

    if support_chunk and support_chunk.get("section") != section:
        support_bullets = format_bullets_from_text(support_chunk.get("text", ""))
        if support_bullets and (
            "checklist" in normalized_message or
            "complete" in normalized_message or
            "all" in normalized_message
        ):
            extra = "\n\nYou may also need to check:\n" + "\n".join([f"• {item}" for item in support_bullets[:4]])
            reply += extra

    if "filename" in normalized_message and "soft_copy" in intents:
        reply += "\n\nUse this filename format: LastName_FirstName_OJT Portfolio."

    if "color" in normalized_message and "department" in normalized_message:
        reply += "\n\nMake sure to use the folder color assigned to your department."

    return reply.strip()


def retrieve_best_answer(message: str) -> Dict:
    chunks = load_knowledge_base()

    if not chunks:
        return {
            "reply": "ORBI knowledge base is not ready yet. Please add content to the knowledge_base files first.",
            "source": "system",
            "section": "Knowledge Base",
            "confidence": 0.0
        }

    top_chunks = choose_top_chunks(message, chunks, top_n=2)
    best_score, best_chunk = top_chunks[0]
    support_chunk = top_chunks[1][1] if len(top_chunks) > 1 else None

    if best_score <= 0:
        return {
            "reply": (
                "I couldn’t find a clear answer yet. You can ask me about OJT portfolio requirements, "
                "soft copy and hard copy submission, internship steps before, during, or after OJT, "
                "and the MOA process."
            ),
            "source": "knowledge_base",
            "section": "Fallback",
            "confidence": 0.15
        }

    confidence = min(round(best_score / 12, 2), 0.99)
    tailored_reply = make_student_friendly_reply(message, best_chunk, support_chunk)

    return {
        "reply": tailored_reply,
        "source": best_chunk["source"],
        "section": best_chunk["section"],
        "confidence": confidence
    }