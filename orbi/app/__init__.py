from flask import Flask
from .config import Config
from .extensions import cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    cors.init_app(app)

    # Register blueprints
    from .routes.chat import chat_bp
    app.register_blueprint(chat_bp)

    return app