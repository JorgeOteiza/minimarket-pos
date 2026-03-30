from flask import Blueprint, request, jsonify
from extensions import db
from models.product import Product

products_bp = Blueprint("products", __name__)


@products_bp.route("/products", methods=["POST"])
def create_product():
    data = request.json

    product = Product(
        name=data["name"],
        barcode=data.get("barcode"),
        price=data["price"],
        cost=data.get("cost"),
        stock=data.get("stock", 0),
        is_weighted=data.get("is_weighted", False),
        weight=data.get("weight"),
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Producto creado"}), 201