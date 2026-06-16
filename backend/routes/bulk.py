from flask import Blueprint, jsonify, request

from backend.exceptions import AppError
from backend.services.bulk_service import (
    create_bulk_product,
    delete_bulk_product,
    get_bulk_products,
    get_bulk_restocks,
    register_bulk_restock,
    update_bulk_product,
)


bulk_bp = Blueprint("bulk", __name__)


@bulk_bp.route("/bulk-products", methods=["GET"])
def list_bulk_products():
    products = get_bulk_products()

    return jsonify([product.to_dict() for product in products]), 200


@bulk_bp.route("/bulk-products", methods=["POST"])
def create_bulk_product_route():
    try:
        data = request.get_json() or {}
        product = create_bulk_product(data)

        return jsonify(product.to_dict()), 201

    except AppError as err:
        return jsonify({"error": err.message}), err.status_code

    except Exception as err:
        return jsonify({"error": str(err)}), 500


@bulk_bp.route("/bulk-products/<int:product_id>", methods=["PUT"])
def update_bulk_product_route(product_id):
    try:
        data = request.get_json() or {}
        product = update_bulk_product(product_id, data)

        return jsonify(product.to_dict()), 200

    except AppError as err:
        return jsonify({"error": err.message}), err.status_code

    except Exception as err:
        return jsonify({"error": str(err)}), 500


@bulk_bp.route("/bulk-products/<int:product_id>", methods=["DELETE"])
def delete_bulk_product_route(product_id):
    try:
        result = delete_bulk_product(product_id)

        return jsonify(result), 200

    except AppError as err:
        return jsonify({"error": err.message}), err.status_code

    except Exception as err:
        return jsonify({"error": str(err)}), 500


@bulk_bp.route("/bulk-restocks", methods=["GET"])
def list_bulk_restocks():
    limit = request.args.get("limit", default=100, type=int)

    restocks = get_bulk_restocks(limit=limit)

    return jsonify([restock.to_dict() for restock in restocks]), 200


@bulk_bp.route("/bulk-restocks", methods=["POST"])
def create_bulk_restock_route():
    try:
        data = request.get_json() or {}
        restock = register_bulk_restock(data)

        return jsonify(restock.to_dict()), 201

    except AppError as err:
        return jsonify({"error": err.message}), err.status_code

    except Exception as err:
        return jsonify({"error": str(err)}), 500