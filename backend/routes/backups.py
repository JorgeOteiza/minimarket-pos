from flask import Blueprint, jsonify, send_file

from backend.services.backup_service import (
    create_backup,
    create_daily_auto_backup,
    delete_backup,
    get_backup_file_path,
    list_backups,
    restore_backup,
)


backups_bp = Blueprint("backups", __name__)


@backups_bp.route("/backups", methods=["GET"])
def get_backups_route():
    return jsonify(list_backups()), 200


@backups_bp.route("/backups/create", methods=["POST"])
def create_backup_route():
    backup = create_backup()

    return jsonify(
        {
            "message": "Respaldo creado correctamente.",
            "backup": backup,
        }
    ), 201


@backups_bp.route("/backups/create-auto-daily", methods=["POST"])
def create_daily_auto_backup_route():
    result = create_daily_auto_backup()

    return jsonify(result), 201 if result["created"] else 200


@backups_bp.route("/backups/<path:filename>/restore", methods=["POST"])
def restore_backup_route(filename):
    result = restore_backup(filename)

    return jsonify(result), 200


@backups_bp.route("/backups/<path:filename>", methods=["DELETE"])
def delete_backup_route(filename):
    result = delete_backup(filename)

    return jsonify(result), 200


@backups_bp.route("/backups/<path:filename>/download", methods=["GET"])
def download_backup_route(filename):
    backup_path = get_backup_file_path(filename)

    return send_file(
        backup_path,
        as_attachment=True,
        download_name=filename,
    )