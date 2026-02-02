from flask import Flask, app
from dotenv import load_dotenv

from app.extensions import db, migrate, jwt, cors

def create_app() -> Flask:
    load_dotenv()

    from app.config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # IMPORTANT: import models so Alembic sees them
    from app import models  # noqa: F401

    # register blueprints
    from app.routes.health_routes import health_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.student_profile_routes import student_profile_bp
    from app.routes.admin_profile_routes import admin_profile_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(student_profile_bp)
    app.register_blueprint(admin_profile_bp)

    from flask import send_from_directory

    @app.route("/uploads/profile_photos/<filename>")
    def serve_profile_photo(filename):
        return send_from_directory(
            app.config["UPLOAD_FOLDER"],
            filename
        )
    
    @app.route("/uploads/<path:filename>")
    def uploaded_files(filename):
        upload_folder = app.config["UPLOAD_FOLDER"]
        return send_from_directory(upload_folder, filename)
    
    return app
