import os
from werkzeug.utils import secure_filename
from flask import current_app

def save_moa_file(file):
    filename = secure_filename(file.filename)
    upload_folder = current_app.config["UPLOAD_MOA_FOLDER"]

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    return file_path

def save_hte_thumbnail(file):
    filename = secure_filename(file.filename)
    upload_folder = current_app.config["UPLOAD_HTE_THUMBNAILS"]

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)

    return file_path