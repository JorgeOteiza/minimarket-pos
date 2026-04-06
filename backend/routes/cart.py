from flask import Blueprint, request, jsonify

from services.cart_service import (
    get_cart,
    add_to_cart,
    remove_from_cart,
    decrease_quantity,
    clear_cart,
    checkout
)

cart_bp = Blueprint("cart", __name__)


# 🔹 Obtener carrito actual
@cart_bp.route("/cart", methods=["GET"])
def get_cart_route():
    cart = get_cart()
    return jsonify(cart), 200


# 🔹 Agregar producto
@cart_bp.route("/cart/add", methods=["POST"])
def add_to_cart_route():
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    cart = add_to_cart(product_id, quantity)

    return jsonify(cart), 200


# 🔹 Remover producto completo
@cart_bp.route("/cart/<int:product_id>", methods=["DELETE"])
def remove_from_cart_route(product_id):
    cart = remove_from_cart(product_id)

    return jsonify(cart), 200


# 🔹 Disminuir cantidad
@cart_bp.route("/cart/decrease", methods=["POST"])
def decrease_quantity_route():
    print("DECREASE ENDPOINT HIT")
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    cart = decrease_quantity(product_id, quantity)

    return jsonify(cart), 200


# 🔹 Vaciar carrito
@cart_bp.route("/cart/clear", methods=["POST"])
def clear_cart_route():
    result = clear_cart()
    return jsonify(result), 200


# 🔹 Confirmar venta
@cart_bp.route("/cart/checkout", methods=["POST"])
def checkout_route():
    sale = checkout()

    return jsonify({
        "message": "Sale completed",
        "sale_id": sale.id,
        "total": float(sale.total_amount)
    }), 201