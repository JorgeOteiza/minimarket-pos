from flask import Blueprint, request, jsonify
from services.product_service import (
    get_all_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product,
)

products_bp = Blueprint("products", __name__)


# 🔹 GET ALL
@products_bp.route("/products", methods=["GET"])
def get_products():
    products = get_all_products()
    return jsonify([p.to_dict() for p in products]), 200


# 🔹 GET BY ID
@products_bp.route("/products/<int:id>", methods=["GET"])
def get_product(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product.to_dict()), 200


# 🔹 CREATE
@products_bp.route("/products", methods=["POST"])
def create_product_route():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data"}), 400

    if not data.get("name") or data.get("price") is None:
        return jsonify({"error": "name and price required"}), 400

    product = create_product(data)

    return jsonify(product.to_dict()), 201

# 🔹 UPDATE
@products_bp.route("/products/<int:id>", methods=["PUT"])
def update_product_route(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    updated_product = update_product(product, data)

    return jsonify(updated_product.to_dict()), 200

# 🔹 DELETE
@products_bp.route("/products/<int:id>", methods=["DELETE"])
def delete_product_route(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    delete_product(product)

    return jsonify({"message": "Product deleted"}), 200