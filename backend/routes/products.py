from flask import Blueprint, request, jsonify
from extensions import db
from models import Product

products_bp = Blueprint("products", __name__)


@products_bp.route("/products", methods=["POST"])
def create_product():
    try:
        data = request.get_json()

        # 🔍 Validación básica
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        name = data.get("name")
        price = data.get("price")

        if not name or price is None:
            return jsonify({"error": "name and price are required"}), 400

        # 🧠 Crear instancia
        product = Product(
            name=name,
            price=price,
            barcode=data.get("barcode"),
            cost=data.get("cost"),
            stock=data.get("stock", 0),
            min_stock=data.get("min_stock", 5),
            is_weighted=data.get("is_weighted", False),
            weight=data.get("weight"),
            margin=data.get("margin", 0.3),
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500