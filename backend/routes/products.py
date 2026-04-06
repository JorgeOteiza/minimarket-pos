from flask import Blueprint, request, jsonify
from services.product_service import (
    get_all_products,
    get_product_by_id,
    create_product as create_product_service,
    update_product as update_product_service,
    delete_product,
    get_product_by_barcode,
)
from schemas.product_schema import ProductSchema

products_bp = Blueprint("products", __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)


# 🔹 GET ALL
@products_bp.route("/products", methods=["GET"])
def get_products():
    products = get_all_products()
    return jsonify(products_schema.dump(products)), 200


# 🔹 GET BY ID
@products_bp.route("/products/<int:id>", methods=["GET"])
def get_product(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product_schema.dump(product)), 200


@products_bp.route("/products/barcode/<string:barcode>", methods=["GET"])
def get_product_by_barcode_route(barcode):
    product = get_product_by_barcode(barcode)

    if not product:
        from exceptions import NotFoundError
        raise NotFoundError("Product not found")

    return jsonify(product_schema.dump(product)), 200


# 🔹 CREATE
@products_bp.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()

    validated_data = product_schema.load(data)

    product = create_product_service(validated_data)

    return jsonify(product_schema.dump(product)), 201


# 🔹 UPDATE
@products_bp.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    validated_data = product_schema.load(data, partial=True)

    updated_product = update_product_service(product, validated_data)

    return jsonify(product_schema.dump(updated_product)), 200


# 🔹 DELETE
@products_bp.route("/products/<int:id>", methods=["DELETE"])
def delete_product_route(id):
    product = get_product_by_id(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    delete_product(product)

    return jsonify({"message": "Product deleted"}), 200