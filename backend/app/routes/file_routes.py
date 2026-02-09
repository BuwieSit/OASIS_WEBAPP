import os
from flask import Blueprint, send_from_directory, abort, current_app

file_bp = Blueprint(
    "file_bp",
    __name__,
    url_prefix="/api"
)

@file_bp.route("/files/<path:filename>")
def serve_file(filename):
    upload_root = os.path.join(current_app.root_path, "..", "uploads")

    file_path = os.path.join(upload_root, filename)

    if not os.path.exists(file_path):
        abort(404)

    return send_from_directory(upload_root, filename)

