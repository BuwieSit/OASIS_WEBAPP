def is_student_webmail(email: str) -> bool:
    email = (email or "").strip().lower()
    return email.endswith("@iskolarngbayan.pup.edu.ph")

def normalize_identifier(identifier: str) -> str:
    return (identifier or "").strip()
