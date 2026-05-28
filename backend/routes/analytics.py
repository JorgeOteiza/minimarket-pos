from flask import Blueprint, jsonify

from backend.services.analytics_service import get_analytics_summary

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/analytics/summary", methods=["GET"])
def analytics_summary():
    return jsonify(get_analytics_summary()), 200