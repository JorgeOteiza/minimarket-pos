from flask import Blueprint, request, jsonify
from schemas.sale_schema import SaleInputSchema, SaleOutputSchema
from services.sale_service import create_sale, get_all_sales, get_sale_by_id

sales_bp = Blueprint("sales", __name__)

sale_input_schema = SaleInputSchema()
sale_output_schema = SaleOutputSchema()


@sales_bp.route("/sales", methods=["GET"])
def get_sales():
    sales = get_all_sales()
    return jsonify(sale_output_schema.dump(sales, many=True)), 200


@sales_bp.route("/sales/<int:id>", methods=["GET"])
def get_sale(id):
    sale = get_sale_by_id(id)

    if not sale:
        return jsonify({"error": "Sale not found"}), 404

    return jsonify(sale_output_schema.dump(sale)), 200


@sales_bp.route("/sales", methods=["POST"])
def create_sale_route():
    try:
        data = request.get_json()

        validated_data = sale_input_schema.load(data)

        sale = create_sale(validated_data)

        return jsonify(sale_output_schema.dump(sale)), 201

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 400