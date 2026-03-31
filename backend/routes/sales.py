from flask import Blueprint, request, jsonify
from schemas.sale_schema import SaleInputSchema, SaleOutputSchema
from services.sale_service import create_sale

sales_bp = Blueprint("sales", __name__)

sale_input_schema = SaleInputSchema()
sale_output_schema = SaleOutputSchema()


@sales_bp.route("/sales", methods=["GET"])
def get_sales():
    return jsonify({"message": "Not implemented yet"}), 200

@sales_bp.route("/sales", methods=["POST"])
def create_sale_route():
    try:
        data = request.get_json()

        # 🔥 VALIDACIÓN REAL
        validated_data = sale_input_schema.load(data)

        sale = create_sale(validated_data)

        return jsonify(sale_output_schema.dump(sale)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400