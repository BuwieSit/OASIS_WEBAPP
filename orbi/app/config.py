import os

class Config:
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = ENV == "development"
    SECRET_KEY = os.getenv("ORBI_SECRET_KEY", "orbi-dev-key")