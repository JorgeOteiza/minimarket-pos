from flask import Blueprint, jsonify, request

from backend.services.business_settings_service import (
    get_business_settings,
    update_business_settings,
)


business_settings_bp = Blueprint("business_settings", __name__)


@business_settings_bp.route("/business-settings", methods=["GET"])
def get_business_settings_route():
    settings = get_business_settings()

    return jsonify(settings.to_dict()), 200


@business_settings_bp.route("/business-settings", methods=["PUT"])
def update_business_settings_route():
    data = request.get_json() or {}

    settings = update_business_settings(data)

    return jsonify(settings.to_dict()), 200