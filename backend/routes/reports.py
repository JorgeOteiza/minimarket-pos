from flask import Blueprint, jsonify, request, send_file
from backend.services.reports_service import get_sales_report
from backend.services.pdf_report_service import generate_sales_report_pdf

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/reports/sales", methods=["GET"])
def sales_report_route():
    period = request.args.get("period", default="today", type=str)

    report = get_sales_report(period=period)

    return jsonify(report), 200

@reports_bp.route("/reports/sales/pdf", methods=["GET"])
def sales_report_pdf_route():
    period = request.args.get("period", default="today", type=str)

    pdf_buffer, filename = generate_sales_report_pdf(period=period)

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )