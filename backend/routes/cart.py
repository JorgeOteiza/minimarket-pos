from flask import Blueprint, request, jsonify

from services.product_service import get_product_by_barcode
from services.cart_service import (
    get_cart,
    add_to_cart,
    remove_from_cart,
    decrease_quantity,
    clear_cart,
    checkout
)

from exceptions import NotFoundError, ValidationError

cart_bp = Blueprint("cart", __name__)


# 🔹 Helper: respuesta estándar JSON
def success_response(data, status=200):
    return jsonify(data), status


# 🔹 Obtener carrito actual
@cart_bp.route("/cart", methods=["GET"])
def get_cart_route():
    cart = get_cart()
    return success_response(cart)


# 🔹 Escaneo por código de barras (CORE POS)
@cart_bp.route("/cart/scan/<string:barcode>", methods=["POST"])
def scan_product_route(barcode):
    product = get_product_by_barcode(barcode)

    if not product:
        raise NotFoundError("Product not found")

    # ⚠️ IMPORTANTE: frontend puede no enviar body → fallback seguro
    data = request.get_json(silent=True) or {}

    quantity = data.get("quantity")

    # 🔹 lógica POS realista (peso vs unidad)
    if quantity is None:
        quantity = 0.25 if getattr(product, "is_weighted", False) else 1

    updated_cart = add_to_cart(product.id, quantity)

    return success_response(updated_cart)


# 🔹 Agregar producto manual
@cart_bp.route("/cart/add", methods=["POST"])
def add_to_cart_route():
    data = request.get_json(silent=True) or {}

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not product_id:
        raise ValidationError("product_id is required")

    updated_cart = add_to_cart(product_id, quantity)

    return success_response(updated_cart)


# 🔹 Remover producto completo
@cart_bp.route("/cart/<int:product_id>", methods=["DELETE"])
def remove_from_cart_route(product_id):
    updated_cart = remove_from_cart(product_id)
    return success_response(updated_cart)


# 🔹 Disminuir cantidad
@cart_bp.route("/cart/decrease", methods=["POST"])
def decrease_quantity_route():
    data = request.get_json(silent=True) or {}

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not product_id:
        raise ValidationError("product_id is required")

    updated_cart = decrease_quantity(product_id, quantity)

    return success_response(updated_cart)


# 🔹 Vaciar carrito
@cart_bp.route("/cart/clear", methods=["POST"])
def clear_cart_route():
    result = clear_cart()

    return success_response({
        "message": "Cart cleared",
        "cart": result
    })


# 🔹 Confirmar venta
@cart_bp.route("/cart/checkout", methods=["POST"])
def checkout_route():
    sale = checkout()

    return success_response({
        "message": "Sale completed",
        "sale_id": sale.id,
        "total": float(sale.total_amount)
    }, status=201)