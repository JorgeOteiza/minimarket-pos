from flask import Blueprint, request, jsonify
from backend.services.product_service import (
    get_all_products,
    get_paginated_products,
    get_product_by_id,
    create_product as create_product_service,
    update_product as update_product_service,
    delete_product,
    get_product_by_barcode,
    search_products_by_name,
    search_products_paginated,
)
from backend.schemas.product_schema import ProductSchema

products_bp = Blueprint("products", __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)


def pagination_response(pagination):
    return {
        "items": products_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages,
    }

# 🔹 GET ALL
@products_bp.route("/products", methods=["GET"])
def get_products():
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=100, type=int)

    per_page = min(per_page, 200)

    pagination = get_paginated_products(page=page, per_page=per_page)

    return jsonify(pagination_response(pagination)), 200


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
        from backend.exceptions import NotFoundError
        raise NotFoundError("Product not found")

    return jsonify(product_schema.dump(product)), 200


@products_bp.route("/products/search", methods=["GET"])
def search_products():
    query = request.args.get("q")

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=100, type=int)

    per_page = min(per_page, 200)

    if not query:
        return jsonify({
            "error": "Query param 'q' is required"
        }), 400

    pagination = search_products_paginated(
        query,
        page=page,
        per_page=per_page,
    )

    return jsonify(
        pagination_response(pagination)
    ), 200


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