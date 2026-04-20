import json
import re
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import requests


BASE_DIR = Path(__file__).resolve().parents[2]
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"
CACHED_KB = None

BACKEND_URL = os.getenv("BACKEND_URL", "https://your-backend-service.onrender.com/api/orbi")
BACKEND_PUBLIC_BASE = os.getenv("BACKEND_PUBLIC_BASE", "https://your-backend-service.onrender.com")

STOPWORDS = {
    "what", "is", "are", "the", "a", "an", "for", "of", "to", "in", "on", "at",
    "and", "or", "my", "i", "me", "do", "does", "how", "when", "where", "which",
    "can", "could", "should", "would", "please", "tell", "about"
}

COURSE_ALIASES = {
    "DIT": ["DIT", "IT", "BSIT", "INFORMATION TECHNOLOGY"],
    "IT": ["IT", "BSIT", "INFORMATION TECHNOLOGY", "DIT"],
    "BSIT": ["BSIT", "IT", "INFORMATION TECHNOLOGY", "DIT"],
    "INFORMATION TECHNOLOGY": ["INFORMATION TECHNOLOGY", "IT", "BSIT", "DIT"],
    "COMPUTER SCIENCE": ["COMPUTER SCIENCE", "CS", "BSCS"],
    "CS": ["CS", "BSCS", "COMPUTER SCIENCE"],
    "BSCS": ["BSCS", "CS", "COMPUTER SCIENCE"],
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

FOLLOW_UP_MARKERS = {
    "that", "this", "it", "those", "these", "next", "after", "then",
    "also", "too", "instead", "same", "one", "another"
}

DB_CACHE = {}
DB_CACHE_LIMIT = 50


def get_cached_db_result(key: str):
    return DB_CACHE.get(key)


def set_cached_db_result(key: str, value):
    if len(DB_CACHE) >= DB_CACHE_LIMIT:
        first_key = next(iter(DB_CACHE))
        DB_CACHE.pop(first_key, None)
    DB_CACHE[key] = value


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fuzzy_score(a: str, b: str) -> int:
    a = normalize_text(a)
    b = normalize_text(b)

    if not a or not b:
        return 0
    if a == b:
        return 100
    if a in b:
        return 95
    if b in a:
        return 90

    a_words = set(a.split())
    b_words = set(b.split())

    if not a_words or not b_words:
        return 0

    overlap = len(a_words.intersection(b_words))
    ratio = overlap / max(len(a_words), len(b_words))
    return int(ratio * 100)


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
    global CACHED_KB

    if CACHED_KB is not None:
        return CACHED_KB

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

    CACHED_KB = chunks
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


def looks_like_follow_up(message: str) -> bool:
    normalized = normalize_text(message)
    words = normalized.split()

    if len(words) <= 5:
        return True

    if any(word in FOLLOW_UP_MARKERS for word in words):
        return True

    if normalized.startswith(("and ", "what about", "how about", "then ", "after that", "next")):
        return True

    return False


def get_recent_user_context(history: Optional[List[Dict]]) -> List[str]:
    if not history:
        return []

    recent_questions = []
    for item in reversed(history):
        if not isinstance(item, dict):
            continue
        if str(item.get("role", "")).strip().lower() != "user":
            continue

        text = str(item.get("text", "")).strip()
        if text:
            recent_questions.append(text)

        if len(recent_questions) >= 3:
            break

    return list(reversed(recent_questions))


def enrich_message_with_history(message: str, history: Optional[List[Dict]] = None) -> str:
    normalized = normalize_text(message)
    recent_questions = get_recent_user_context(history)

    if not recent_questions:
        return message

    last_question = recent_questions[-1]

    if not looks_like_follow_up(message):
        return message

    if "hard copy" in normalized:
        return f"{last_question} about the hard copy"

    if "soft copy" in normalized:
        return f"{last_question} about the soft copy"

    if "filename" in normalized:
        return f"{last_question} specifically asking for the filename format"

    if "color" in normalized or "folder" in normalized:
        return f"{last_question} specifically asking about folder color"

    if normalized in {"what about that", "what about it", "what about this", "and that", "and this"}:
        return last_question

    if "next" in normalized or "after that" in normalized or "then" in normalized:
        return f"{last_question} and what comes next"

    if normalized.startswith("what about"):
        return f"{last_question} {message}"

    return f"{last_question} {message}"


def infer_intents_from_history(message: str, history: Optional[List[Dict]] = None) -> List[str]:
    intents = detect_intents(message)
    if intents:
        return intents

    recent_questions = get_recent_user_context(history)
    for question in reversed(recent_questions):
        previous_intents = detect_intents(question)
        if previous_intents:
            return previous_intents

    return []


def section_priority_score(message: str, section_name: str) -> float:
    normalized_message = normalize_text(message)
    score = 0.0

    for section, hints in SECTION_PRIORITY_HINTS.items():
        if section.lower() == section_name.lower():
            for hint in hints:
                if normalize_text(hint) in normalized_message:
                    score += 2.0

    return score


def score_chunk(message: str, chunk: Dict, intents: Optional[List[str]] = None) -> float:
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
    intents = intents or detect_intents(message)

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


def choose_top_chunks(
    message: str,
    chunks: List[Dict],
    top_n: int = 2,
    intents: Optional[List[str]] = None
) -> List[Tuple[float, Dict]]:
    scored = [(score_chunk(message, chunk, intents=intents), chunk) for chunk in chunks]
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


def question_style(message: str) -> str:
    normalized = normalize_text(message)

    if any(word in normalized for word in ["what", "ano", "what is", "what are"]):
        return "direct"
    if any(word in normalized for word in ["how", "paano", "process", "steps", "next", "after that"]):
        return "steps"
    if any(word in normalized for word in ["list", "checklist", "requirements", "need", "include"]):
        return "bullets"
    return "direct"


def make_intro(message: str, intents: List[str], section: str) -> str:
    normalized = normalize_text(message)

    if "soft_copy" in intents:
        return "For the soft copy of your OJT portfolio, here’s what you need to prepare."
    if "hard_copy" in intents:
        return "For the hard copy of your OJT portfolio, these are the important requirements."
    if "before_internship" in intents:
        return "Before starting your internship, you need to complete these first."
    if "during_internship" in intents:
        return "During your internship, these are the things you’re expected to do."
    if "after_internship" in intents:
        return "After your internship, these are the next steps you need to finish."
    if "moa_process" in intents:
        return "If the HTE still does not have an existing MOA, this is the usual process."
    if "department_color" in intents:
        return "The folder color depends on your department."
    if "portfolio" in intents:
        return "For your OJT portfolio, these are the main requirements you should prepare."

    if "when" in normalized:
        return f"This usually falls under {section.lower()}."
    if "how" in normalized:
        return f"Here’s the process based on {section.lower()}."
    return f"Here’s the most relevant answer based on {section.lower()}."


def make_direct_answer(message: str, best_chunk: Dict, intents: List[str]) -> str:
    section = best_chunk.get("section", "")
    text = best_chunk.get("text", "")
    bullets = format_bullets_from_text(text)
    intro = make_intro(message, intents, section)

    if not bullets:
        return f"{intro}\n\n{text}".strip()

    if "department_color" in intents:
        return f"{intro}\n\n" + "\n".join([f"• {item}" for item in bullets[:6]])

    if "moa_process" in intents:
        return (
            f"{intro}\n\n"
            "You may follow these steps:\n" +
            "\n".join([f"• {item}" for item in bullets[:10]])
        ).strip()

    if "soft_copy" in intents or "hard_copy" in intents or "portfolio" in intents:
        return (
            f"{intro}\n\n"
            "The key items are:\n" +
            "\n".join([f"• {item}" for item in bullets[:8]])
        ).strip()

    if "before_internship" in intents or "during_internship" in intents or "after_internship" in intents:
        return (
            f"{intro}\n\n"
            "You should focus on these:\n" +
            "\n".join([f"• {item}" for item in bullets[:8]])
        ).strip()

    return f"{intro}\n\n" + "\n".join([f"• {item}" for item in bullets[:8]])


def make_paragraph_answer(message: str, best_chunk: Dict, intents: List[str]) -> str:
    section = best_chunk.get("section", "")
    text = best_chunk.get("text", "")
    bullets = format_bullets_from_text(text)
    intro = make_intro(message, intents, section)

    if not bullets:
        return f"{intro}\n\n{text}".strip()

    if "soft_copy" in intents:
        details = ", ".join(bullets[:6])
        return (
            f"{intro}\n\n"
            f"You need to submit it in PDF format and make sure the file follows the required filename format. "
            f"It should include items such as {details}. "
            f"Make sure your portfolio is complete, organized, and professionally prepared."
        ).strip()

    if "hard_copy" in intents:
        details = ", ".join(bullets[:4])
        return (
            f"{intro}\n\n"
            f"Your hard copy should follow the required physical format, including {details}. "
            f"Everything should be clean, readable, and properly labeled before submission."
        ).strip()

    if "before_internship" in intents:
        return (
            f"{intro}\n\n"
            "Before your internship begins, make sure you attend the pre-internship orientation, "
            "submit your intent letter, and enroll in the internship course. "
            "These steps help prepare you before your actual training starts."
        ).strip()

    if "during_internship" in intents:
        return (
            f"{intro}\n\n"
            "While you are already undergoing internship, you need to attend consultations and monitoring, "
            "join the HTE orientation, submit the required reports, start on time, and report any issues right away. "
            "These help you stay updated and compliant throughout your OJT."
        ).strip()

    if "after_internship" in intents:
        return (
            f"{intro}\n\n"
            "After finishing your internship, you need to submit your portfolio to your internship adviser, "
            "answer the post-OJT student feedback form, and wait for the final evaluation and grade computation."
        ).strip()

    if "moa_process" in intents:
        return (
            f"{intro}\n\n"
            "The MOA usually goes through several steps, starting from identifying a new potential HTE, "
            "submission to the HTE, review by the OJT Coordinator and legal office, approval, printing, signing, "
            "retrieval, and notarization. It is important to follow each step carefully to avoid delays."
        ).strip()

    if "department_color" in intents:
        return (
            f"{intro}\n\n"
            "Make sure you use the folder color assigned to your department so your hard copy submission follows the required format."
        ).strip()

    return f"{intro}\n\n{text}".strip()


def add_helpful_tail(message: str, reply: str, intents: List[str]) -> str:
    normalized = normalize_text(message)

    if "filename" in normalized or "soft_copy" in intents:
        if "lastname_firstname_ojt portfolio" not in normalize_text(reply):
            reply += "\n\nUse this filename format: LastName_FirstName_OJT Portfolio."

    if "soft copy" in normalized and "pdf" not in normalize_text(reply):
        reply += "\n\nAlso make sure your soft copy is submitted in PDF format."

    if "hard copy" in normalized and "legal bond paper" not in normalize_text(reply):
        reply += "\n\nAlso make sure the hard copy is printed on legal bond paper."

    if "moa_process" in intents and "next moa step" not in normalize_text(reply):
        reply += "\n\nYou can also ask ORBI about the next MOA step if you want a more specific guide."

    return reply.strip()


def make_student_friendly_reply(
    message: str,
    best_chunk: Dict,
    support_chunk: Dict = None,
    intents: Optional[List[str]] = None
) -> str:
    intents = intents or detect_intents(message)
    style = question_style(message)

    if style in {"bullets", "steps"}:
        reply = make_direct_answer(message, best_chunk, intents)
    else:
        reply = make_paragraph_answer(message, best_chunk, intents)

    if support_chunk and support_chunk.get("section") != best_chunk.get("section"):
        normalized_message = normalize_text(message)
        support_bullets = format_bullets_from_text(support_chunk.get("text", ""))

        if support_bullets and any(word in normalized_message for word in ["all", "complete", "everything", "checklist"]):
            reply += "\n\nYou may also need to check:\n" + "\n".join([f"• {item}" for item in support_bullets[:4]])

    reply = add_helpful_tail(message, reply, intents)
    return reply.strip()


def _extract_company_name(message: str) -> str:
    patterns = [
        r"(?:status of|moa status of|download moa of|moa file of|moa of|details of|info of|information of)\s+(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            return match.group(1).strip(" ?.,:")

    return ""


def _normalize_upload_path(path: str) -> str:
    if not path:
        return ""

    clean_path = str(path).replace("\\", "/").strip()
    if clean_path.startswith("uploads/"):
        clean_path = clean_path[len("uploads/"):]

    return clean_path


def _expand_course_aliases(course_input: str) -> List[str]:
    normalized_course = course_input.strip().upper()
    return COURSE_ALIASES.get(normalized_course, [normalized_course])


def _deduplicate_htes(items: List[Dict]) -> List[Dict]:
    seen = set()
    unique_items = []

    for item in items:
        company_name = str(item.get("company_name", "")).strip().lower()
        if company_name and company_name not in seen:
            seen.add(company_name)
            unique_items.append(item)

    return unique_items


def _fetch_all_htes(limit: int = 30) -> List[Dict]:
    res = requests.get(
        f"{BACKEND_URL}/htes",
        params={"limit": limit},
        timeout=1.0
    )
    if res.status_code != 200:
        return []
    data = res.json()
    return data if isinstance(data, list) else []


def _best_hte_match(company: str, all_htes: List[Dict]) -> Optional[Dict]:
    best_match = None
    best_score_value = 0

    for hte in all_htes:
        score = fuzzy_score(company, hte.get("company_name", ""))
        if score > best_score_value:
            best_score_value = score
            best_match = hte

    if not best_match or best_score_value < 40:
        return None

    return best_match


def try_database_query(message: str):
    if len(message.strip()) <= 2:
        return None

    normalized = normalize_text(message)
    cache_key = normalize_text(message)
    cached = get_cached_db_result(cache_key)
    if cached is not None:
        return cached

    try:
        if not any(keyword in normalized for keyword in ["hte", "moa", "status", "company", "file", "details", "info"]):
            return None

        all_htes = _fetch_all_htes(limit=50)
        if not all_htes:
            return None

        # HTEs under a course
        if "hte" in normalized and ("under" in normalized or "for" in normalized):
            words = normalized.split()
            trigger_word = "under" if "under" in words else "for" if "for" in words else None

            if trigger_word:
                idx = words.index(trigger_word)
                if idx + 1 < len(words):
                    course_input = words[idx + 1].upper()
                    course_aliases = _expand_course_aliases(course_input)

                    filtered = [
                        h for h in all_htes
                        if any(alias.lower() in str(h.get("course", "")).lower() for alias in course_aliases)
                    ]

                    unique_results = _deduplicate_htes(filtered)

                    if not unique_results:
                        result = (
                            f"I couldn’t find any HTE under {course_input}. "
                            f"Try checking if the course is labeled differently."
                        )
                        set_cached_db_result(cache_key, result)
                        return result

                    lines = [f"Here are HTEs under {course_input}:"]
                    for hte in unique_results[:10]:
                        lines.append(f"• {hte['company_name']} ({hte['moa_status']})")

                    result = "\n".join(lines)
                    set_cached_db_result(cache_key, result)
                    return result

        # Status of a company
        if "status" in normalized:
            company = _extract_company_name(message)
            if company:
                best_match = _best_hte_match(company, all_htes)

                if not best_match:
                    result = f"I couldn’t find an HTE matching '{company}'."
                    set_cached_db_result(cache_key, result)
                    return result

                result = (
                    f"{best_match['company_name']} currently has a MOA status of "
                    f"{best_match['moa_status']}."
                )
                set_cached_db_result(cache_key, result)
                return result

        # MOA file
        if "moa" in normalized and ("file" in normalized or "download" in normalized):
            company = _extract_company_name(message)
            if company:
                best_match = _best_hte_match(company, all_htes)

                if not best_match:
                    result = f"I couldn’t find an HTE matching '{company}'."
                    set_cached_db_result(cache_key, result)
                    return result

                company_name = best_match["company_name"]

                res = requests.get(
                    f"{BACKEND_URL}/hte",
                    params={"name": company_name},
                    timeout=1.0
                )
                if res.status_code != 200:
                    return None

                data = res.json()
                moa_file = data.get("moa_file")

                if not moa_file:
                    result = f"{data['company_name']} does not have an uploaded MOA file yet."
                    set_cached_db_result(cache_key, result)
                    return result

                normalized_path = _normalize_upload_path(moa_file)
                full_url = f"{BACKEND_PUBLIC_BASE}/uploads/{normalized_path}"

                result = f"Here is the MOA file for {data['company_name']}:\n{full_url}"
                set_cached_db_result(cache_key, result)
                return result

        # Details / info
        if "details" in normalized or "info" in normalized or "information" in normalized:
            company = _extract_company_name(message)
            if company:
                best_match = _best_hte_match(company, all_htes)

                if not best_match:
                    result = f"I couldn’t find an HTE matching '{company}'."
                    set_cached_db_result(cache_key, result)
                    return result

                company_name = best_match["company_name"]

                res = requests.get(
                    f"{BACKEND_URL}/hte",
                    params={"name": company_name},
                    timeout=1.0
                )
                if res.status_code != 200:
                    return None

                data = res.json()

                lines = [
                    f"Here are the details of {data['company_name']}:",
                    f"• Industry: {data.get('industry') or 'N/A'}",
                    f"• MOA Status: {data.get('moa_status') or 'N/A'}",
                    f"• Course: {data.get('course') or 'N/A'}",
                    f"• Address: {data.get('address') or 'N/A'}",
                ]

                if data.get("moa_expiry_date"):
                    lines.append(f"• MOA Expiry Date: {data['moa_expiry_date']}")

                if data.get("moa_file"):
                    normalized_path = _normalize_upload_path(data["moa_file"])
                    lines.append(f"• MOA File: {BACKEND_PUBLIC_BASE}/uploads/{normalized_path}")

                result = "\n".join(lines)
                set_cached_db_result(cache_key, result)
                return result

    except Exception as e:
        print("DB QUERY ERROR:", e)

    return None


def retrieve_best_answer(message: str, history: Optional[List[Dict]] = None) -> Dict:
    resolved_message = enrich_message_with_history(message, history)

    db_result = try_database_query(message)
    if db_result:
        return {
            "reply": db_result,
            "source": "database",
            "section": "HTE Data",
            "confidence": 0.95,
            "resolved_question": resolved_message
        }

    chunks = load_knowledge_base()

    if not chunks:
        return {
            "reply": "ORBI knowledge base is not ready yet. Please add content to the knowledge_base files first.",
            "source": "system",
            "section": "Knowledge Base",
            "confidence": 0.0,
            "resolved_question": resolved_message
        }

    intents = infer_intents_from_history(resolved_message, history)

    top_chunks = choose_top_chunks(resolved_message, chunks, top_n=2, intents=intents)
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
            "confidence": 0.15,
            "resolved_question": resolved_message
        }

    confidence = min(round(best_score / 12, 2), 0.99)
    tailored_reply = make_student_friendly_reply(
        resolved_message,
        best_chunk,
        support_chunk,
        intents=intents
    )

    return {
        "reply": tailored_reply,
        "source": best_chunk["source"],
        "section": best_chunk["section"],
        "confidence": confidence,
        "resolved_question": resolved_message
    }