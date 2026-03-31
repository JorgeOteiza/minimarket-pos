from flask import Blueprint, request, jsonify
from schemas.sale_schema import SaleSchema
from services.sale_service import create_sale

sales_bp = Blueprint("sales", __name__)

sale_schema = SaleSchema()


@sales_bp.route("/sales", methods=["POST"])
def create_sale_route():
    try:
        data = request.get_json()

        validated_data = sale_schema.load(data)

        sale = create_sale(validated_data)

        return jsonify(sale_schema.dump(sale)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400