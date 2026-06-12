from flask import Blueprint, jsonify, request

from backend.services.reports_service import get_sales_report


reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports/sales", methods=["GET"])
def sales_report_route():
    period = request.args.get("period", default="today", type=str)

    report = get_sales_report(period=period)

    return jsonify(report), 200