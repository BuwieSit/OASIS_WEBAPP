from flask import Flask, app
from dotenv import load_dotenv

from app.extensions import db, migrate, jwt, cors

def create_app() -> Flask:
    load_dotenv()

    from app.config import Config
    
    app = Flask(__name__, static_folder="static")
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
    from app.routes.student_dashboard_routes import student_dashboard_bp
    from app.routes.student_hte_routes import student_hte_bp
    from app.routes.student_moa_prospect_routes import student_moa_prospect_bp
    from app.routes.admin_dashboard_routes import admin_dashboard_bp
    from app.routes.admin_announcement_routes import admin_announcement_bp
    from app.routes.student_notification_routes import student_notification_bp
    from app.routes.admin_alert_routes import admin_alert_bp
    from app.routes.admin_student_routes import admin_student_bp
    from app.routes.admin_hte_routes import admin_hte_bp
    from app.routes.admin_moa_routes import admin_moa_bp
    from app.routes.file_routes import file_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(student_profile_bp)
    app.register_blueprint(admin_profile_bp)
    app.register_blueprint(student_dashboard_bp)
    app.register_blueprint(student_hte_bp)
    app.register_blueprint(student_moa_prospect_bp)
    app.register_blueprint(admin_dashboard_bp)
    app.register_blueprint(admin_announcement_bp)
    app.register_blueprint(student_notification_bp)
    app.register_blueprint(admin_alert_bp)
    app.register_blueprint(admin_student_bp)
    app.register_blueprint(admin_hte_bp)
    app.register_blueprint(admin_moa_bp)
    app.register_blueprint(file_bp)

    from flask import send_from_directory
    
    @app.route("/uploads/<path:filename>")
    def uploaded_files(filename):
        return send_from_directory(
            app.config["UPLOAD_ROOT"],  # BASE_DIR/uploads
            filename
        )
    
    return app

