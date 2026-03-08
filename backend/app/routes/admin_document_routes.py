import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.user import UserRole
from app.models.uploaded_document import UploadedDocument


admin_document_bp = Blueprint(
    "admin_document_bp",
    __name__,
    url_prefix="/api/admin/documents"
)

student_document_bp = Blueprint(
    "student_document_bp",
    __name__,
    url_prefix="/api/student/documents"
)

ALLOWED_SECTIONS = {"procedures", "moa", "guidelines", "forms"}
ALLOWED_ITEM_TYPES = {
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


def ensure_upload_dir():
    upload_dir = os.path.join(current_app.root_path, "static", "uploads", "documents")
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def serialize_tree(items):
    item_map = {}
    roots = []

    for item in items:
        item_map[item.id] = {
            "id": item.id,
            "section": item.section,
            "item_type": item.item_type,
            "title": item.title,
            "description": item.description,
            "file_path": item.file_path,
            "original_filename": item.original_filename,
            "parent_id": item.parent_id,
            "sort_order": item.sort_order,
            "uploaded_by": item.uploaded_by,
            "uploaded_at": item.uploaded_at.isoformat() if item.uploaded_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            "children": []
        }

    for item in items:
        node = item_map[item.id]
        if item.parent_id and item.parent_id in item_map:
            item_map[item.parent_id]["children"].append(node)
        else:
            roots.append(node)

    def sort_nodes(nodes):
        nodes.sort(key=lambda x: x["sort_order"])
        for node in nodes:
            sort_nodes(node["children"])

    sort_nodes(roots)
    return roots


def delete_section_files(section):
    items = UploadedDocument.query.filter_by(section=section).all()
    for item in items:
        if item.file_path:
            abs_path = os.path.join(current_app.root_path, item.file_path.lstrip("/"))
            if os.path.exists(abs_path):
                try:
                    os.remove(abs_path)
                except OSError:
                    pass


def save_items_recursive(section, items, parent_id, uploaded_by):
    for index, item in enumerate(items):
        item_type = item.get("item_type")
        title = (item.get("title") or "").strip()
        description = (item.get("description") or "").strip() or None
        file_path = item.get("file_path")
        original_filename = item.get("original_filename")

        if item_type not in ALLOWED_ITEM_TYPES:
            raise ValueError(f"Invalid item_type: {item_type}")

        if not title:
            raise ValueError("Every item must have a title")

        if item_type == "document" and section != "forms":
            raise ValueError("Document uploads are only allowed in Forms & Templates")

        if item_type == "document" and not file_path:
            raise ValueError("Document items require a file_path")

        new_item = UploadedDocument(
            section=section,
            item_type=item_type,
            title=title,
            description=description,
            file_path=file_path,
            original_filename=original_filename,
            parent_id=parent_id,
            sort_order=index,
            uploaded_by=uploaded_by,
        )

        db.session.add(new_item)
        db.session.flush()

        children = item.get("children", [])
        if children:
            save_items_recursive(section, children, new_item.id, uploaded_by)


@admin_document_bp.get("/<section>")
@jwt_required()
def get_admin_section(section):
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    items = (
        UploadedDocument.query
        .filter_by(section=section)
        .order_by(UploadedDocument.sort_order.asc(), UploadedDocument.id.asc())
        .all()
    )

    return jsonify({
        "section": section,
        "items": serialize_tree(items)
    }), 200


@admin_document_bp.post("/<section>/save")
@jwt_required()
def save_admin_section(section):
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    data = request.get_json(silent=True) or {}
    items = data.get("items", [])

    if not isinstance(items, list):
        return jsonify({"error": "items must be an array"}), 400

    try:
        uploaded_by = int(get_jwt_identity())

        delete_section_files(section)
        UploadedDocument.query.filter_by(section=section).delete()
        db.session.flush()

        save_items_recursive(section, items, None, uploaded_by)
        db.session.commit()

        saved_items = (
            UploadedDocument.query
            .filter_by(section=section)
            .order_by(UploadedDocument.sort_order.asc(), UploadedDocument.id.asc())
            .all()
        )

        return jsonify({
            "message": f"{section} saved successfully",
            "section": section,
            "items": serialize_tree(saved_items)
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_document_bp.delete("/<section>/clear")
@jwt_required()
def clear_admin_section(section):
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    try:
        delete_section_files(section)
        UploadedDocument.query.filter_by(section=section).delete()
        db.session.commit()

        return jsonify({
            "message": f"{section} cleared successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@admin_document_bp.post("/upload")
@jwt_required()
def upload_document_file():
    if not is_admin():
        return jsonify({"error": "admin only"}), 403

    section = request.form.get("section", "").strip().lower()
    title = request.form.get("title", "").strip()

    if section != "forms":
        return jsonify({"error": "File upload is only allowed for Forms & Templates"}), 400

    if not title:
        return jsonify({"error": "title is required"}), 400

    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400

    file = request.files["file"]

    if not file or file.filename == "":
        return jsonify({"error": "file is required"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "file type not allowed"}), 400

    upload_dir = ensure_upload_dir()
    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()
    generated_name = f"{uuid.uuid4().hex}.{ext}"
    abs_path = os.path.join(upload_dir, generated_name)
    file.save(abs_path)

    relative_path = f"/static/uploads/documents/{generated_name}"

    return jsonify({
        "message": "file uploaded successfully",
        "file_path": relative_path,
        "original_filename": original_filename,
        "title": title
    }), 200


@student_document_bp.get("/<section>")
def get_student_section(section):
    if section not in ALLOWED_SECTIONS:
        return jsonify({"error": "invalid section"}), 400

    items = (
        UploadedDocument.query
        .filter_by(section=section)
        .order_by(UploadedDocument.sort_order.asc(), UploadedDocument.id.asc())
        .all()
    )

    return jsonify({
        "section": section,
        "items": serialize_tree(items)
    }), 200


@student_document_bp.get("/all")
def get_student_all_sections():
    result = {}

    for section in ALLOWED_SECTIONS:
        items = (
            UploadedDocument.query
            .filter_by(section=section)
            .order_by(UploadedDocument.sort_order.asc(), UploadedDocument.id.asc())
            .all()
        )
        result[section] = serialize_tree(items)

    return jsonify(result), 200