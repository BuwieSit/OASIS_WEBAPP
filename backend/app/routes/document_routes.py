import os
import uuid

from flask import Blueprint, request, jsonify, current_app, send_from_directory, abort
from flask_jwt_extended import jwt_required, get_jwt
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.document_item import DocumentItem
from app.models.user import UserRole


documents_bp = Blueprint(
    "documents_bp",
    __name__,
    url_prefix="/api/documents"
)

ALLOWED_SECTIONS = {"procedures", "moa", "guidelines", "forms"}
ALLOWED_TYPES = {
    "header",
    "description",
    "numerical_list",
    "bulleted_list",
    "alphabetical_list",
    "document",
}
ALLOWED_EXTENSIONS = {
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"
}


def is_admin():
    claims = get_jwt()
    return claims.get("role") == UserRole.ADMIN.value


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def ensure_documents_upload_dir():
    upload_root = current_app.config["UPLOAD_ROOT"]
    target_dir = os.path.join(upload_root, "documents")
    os.makedirs(target_dir, exist_ok=True)
    return target_dir


def extract_storage_filename(file_path):
    """
    Converts '/uploads/documents/sample.pdf' -> 'sample.pdf'
    """
    if not file_path:
        return None

    prefix = "/uploads/documents/"
    if file_path.startswith(prefix):
        return file_path.replace(prefix, "", 1)

    return os.path.basename(file_path)


def build_download_url(item):
    storage_filename = extract_storage_filename(item.file_path)
    if not storage_filename:
        return None

    download_name = f"{secure_filename(item.title)}.{storage_filename.split('.')[-1]}"
    base_url = request.host_url.rstrip("/")

    return f"{base_url}/api/documents/download/{storage_filename}?name={download_name}"


def serialize_tree(items, include_download_url=False):
    node_map = {}
    roots = []

    for item in items:
        node = {
            "id": item.id,
            "section": item.section,
            "type": item.type,
            "title": item.title,
            "description": item.description,
            "parentId": item.parent_id,
            "file": item.file_path,
            "originalFilename": item.original_filename,
            "sortOrder": item.sort_order,
            "children": []
        }

        if include_download_url:
            node["downloadUrl"] = build_download_url(item)

        node_map[item.id] = node

    for item in items:
        node = node_map[item.id]
        if item.parent_id and item.parent_id in node_map:
            node_map[item.parent_id]["children"].append(node)
        else:
            roots.append(node)

    def sort_nodes(nodes):
        nodes.sort(key=lambda x: x["sortOrder"])
        for node in nodes:
            sort_nodes(node["children"])

    sort_nodes(roots)
    return roots


def cleanup_section_files(section):
    existing_items = DocumentItem.query.filter_by(section=section).all()

    for item in existing_items:
        if item.file_path:
            storage_filename = extract_storage_filename(item.file_path)
            if not storage_filename:
                continue

            abs_path = os.path.join(
                current_app.config["UPLOAD_ROOT"],
                "documents",
                storage_filename
            )

            if os.path.exists(abs_path):
                try:
                    os.remove(abs_path)
                except OSError:
                    pass


def validate_item(item, section):
    item_type = (item.get("type") or "").strip().lower()
    title = (item.get("title") or "").strip()
    description = (item.get("description") or "").strip() or None
    file_path = item.get("file")
    original_filename = item.get("originalFilename")

    if item_type not in ALLOWED_TYPES:
        raise ValueError(f"Invalid item type: {item_type}")

    if not title:
        raise ValueError("Each item must have a title")

    if item_type == "document":
        if section != "forms":
            raise ValueError("Document upload is only allowed in Forms & Templates")
        if not file_path:
            raise ValueError("Document items require an uploaded file")

    return {
        "type": item_type,
        "title": title,
        "description": description,
        "file_path": file_path,
        "original_filename": original_filename
    }


def save_items_recursive(section, items, parent_id=None):
    for index, item in enumerate(items):
        payload = validate_item(item, section)

        new_item = DocumentItem(
            id=item.get("id") or str(uuid.uuid4()),
            section=section,
            type=payload["type"],
            title=payload["title"],
            description=payload["description"],
            parent_id=parent_id,
            file_path=payload["file_path"],
            original_filename=payload["original_filename"],
            sort_order=index
        )

        db.session.add(new_item)
        db.session.flush()

        children = item.get("children", [])
        if children:
            save_items_recursive(section, children, new_item.id)


@documents_bp.route("/download/<path:filename>", methods=["GET"])
def download_document(filename):
    documents_dir = ensure_documents_upload_dir()
    abs_path = os.path.join(documents_dir, filename)

    if not os.path.exists(abs_path):
        abort(404)

    download_name = request.args.get("name") or filename

    return send_from_directory(
        documents_dir,
        filename,
        as_attachment=True,
        download_name=download_name
    )


@documents_bp.route("/admin/<section>", methods=["GET"])
@jwt_required()
def get_admin_documents(section):
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    section = section.strip().lower()
    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    items = (
        DocumentItem.query
        .filter_by(section=section)
        .order_by(DocumentItem.sort_order.asc(), DocumentItem.created_at.asc())
        .all()
    )

    return jsonify({
        "section": section,
        "items": serialize_tree(items, include_download_url=False)
    }), 200


@documents_bp.route("/admin/save", methods=["POST"])
@jwt_required()
def save_documents():
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    data = request.get_json(silent=True) or {}
    section = (data.get("section") or "").strip().lower()
    items = data.get("items", [])

    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid or missing section"}), 400

    if not isinstance(items, list):
        return jsonify({"error": "items must be an array"}), 400

    try:
        cleanup_section_files(section)
        DocumentItem.query.filter_by(section=section).delete()
        db.session.flush()

        save_items_recursive(section, items)
        db.session.commit()

        saved_items = (
            DocumentItem.query
            .filter_by(section=section)
            .order_by(DocumentItem.sort_order.asc(), DocumentItem.created_at.asc())
            .all()
        )

        return jsonify({
            "message": "documents saved",
            "section": section,
            "items": serialize_tree(saved_items, include_download_url=False)
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@documents_bp.route("/admin/<section>/clear", methods=["DELETE"])
@jwt_required()
def clear_documents(section):
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    section = section.strip().lower()
    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    try:
        cleanup_section_files(section)
        DocumentItem.query.filter_by(section=section).delete()
        db.session.commit()
        return jsonify({"message": f"{section} cleared successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@documents_bp.route("/admin/upload", methods=["POST"])
@jwt_required()
def upload_document():
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    section = (request.form.get("section") or "").strip().lower()
    title = (request.form.get("title") or "").strip()

    if section != "forms":
        return jsonify({"error": "Only Forms & Templates can upload files"}), 400

    if not title:
        return jsonify({"error": "title is required"}), 400

    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400

    file = request.files["file"]

    if not file or not file.filename:
        return jsonify({"error": "file is required"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "file type not allowed"}), 400

    upload_dir = ensure_documents_upload_dir()

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()

    # rename file based on title
    safe_title = secure_filename(title)

    # fallback if title becomes empty after sanitizing
    if not safe_title:
        safe_title = "document"

    generated_filename = f"{safe_title}.{ext}"
    abs_path = os.path.join(upload_dir, generated_filename)

    # prevent overwriting existing files
    counter = 1
    while os.path.exists(abs_path):
        generated_filename = f"{safe_title}_{counter}.{ext}"
        abs_path = os.path.join(upload_dir, generated_filename)
        counter += 1

    file.save(abs_path)

    relative_path = f"/uploads/documents/{generated_filename}"

    return jsonify({
        "message": "file uploaded successfully",
        "file": relative_path,
        "originalFilename": original_filename,
        "storedFilename": generated_filename,
        "title": title
    }), 200


@documents_bp.route("/student/<section>", methods=["GET"])
def get_student_documents(section):
    section = section.strip().lower()
    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    items = (
        DocumentItem.query
        .filter_by(section=section)
        .order_by(DocumentItem.sort_order.asc(), DocumentItem.created_at.asc())
        .all()
    )

    return jsonify({
        "section": section,
        "items": serialize_tree(items, include_download_url=True)
    }), 200


@documents_bp.route("/student/all", methods=["GET"])
def get_all_student_documents():
    result = {}

    for section in ["procedures", "moa", "guidelines", "forms"]:
        items = (
            DocumentItem.query
            .filter_by(section=section)
            .order_by(DocumentItem.sort_order.asc(), DocumentItem.created_at.asc())
            .all()
        )
        result[section] = serialize_tree(items, include_download_url=True)

    return jsonify(result), 200