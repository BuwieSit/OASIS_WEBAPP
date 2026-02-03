import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def _normalize_database_url(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")

    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI")
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_ROOT = os.path.join(
        BASE_DIR,
        os.getenv("UPLOAD_ROOT", "uploads")
    )

    UPLOAD_HTE_THUMBNAILS = os.path.join(
        BASE_DIR,
        os.getenv("UPLOAD_HTE_THUMBNAILS", "uploads/hte_thumbnails")
    )

    UPLOAD_MOA_FOLDER = os.path.join(
        BASE_DIR,
        os.getenv("UPLOAD_MOA_FOLDER", "uploads/moa")
    )
    
    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        os.getenv("UPLOAD_FOLDER", "uploads/profile_photos")
    )
    
    ALLOWED_EXTENSIONS = set(
        os.getenv("ALLOWED_EXTENSIONS", "png,jpg,jpeg,webp").split(",")
    )

    OTP_DEV_PRINT = os.getenv("OTP_DEV_PRINT", "1") == "1"

    # 1 hour
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60