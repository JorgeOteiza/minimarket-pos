from collections import defaultdict
from backend.models import Product
from backend.extensions import db
from backend.exceptions import NotFoundError, ValidationError
from backend.services.sale_service import create_sale

# 🔹 Carrito en memoria
cart = defaultdict(float)


# 🔹 Obtener carrito actual
def get_cart():
    items = []
    total = 0

    for product_id, quantity in cart.items():
        product = db.session.get(Product, product_id)

        if not product:
            continue

        subtotal = float(product.price) * quantity

        items.append({
            "product_id": product.id,
            "name": product.name,
            "quantity": quantity,
            "unit_price": float(product.price),
            "subtotal": subtotal
        })

        total += subtotal

    return {
        "items": items,
        "total": total
    }


# 🔹 Agregar producto
def add_to_cart(product_id, quantity):
    product = db.session.get(Product, product_id)

    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    if not product.is_weighted and not float(quantity).is_integer():
        raise ValidationError(
            f"Product {product.name} must have integer quantity"
        )

    current_quantity = cart.get(product_id, 0)
    new_quantity = current_quantity + quantity

    if product.stock < new_quantity:
        raise ValidationError(
            f"Not enough stock for {product.name}. Available: {product.stock}"
        )

    cart[product_id] = new_quantity

    return get_cart()


# 🔹 Remover producto
def remove_from_cart(product_id):
    if product_id not in cart:
        raise NotFoundError(f"Product {product_id} not in cart")

    del cart[product_id]
    return get_cart()


# 🔹 Disminuir cantidad
def decrease_quantity(product_id, quantity):
    if product_id not in cart:
        raise NotFoundError(f"Product {product_id} not in cart")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    cart[product_id] -= quantity

    if cart[product_id] <= 0:
        del cart[product_id]

    return get_cart()


# 🔹 Vaciar carrito (🔥 FIX IMPORTANTE)
def clear_cart():
    cart.clear()
    return get_cart()  # 🔥 antes devolvías message → rompía frontend


# 🔹 Checkout
def checkout():
    if not cart:
        raise ValidationError("Cart is empty")

    items = [
        {
            "product_id": product_id,
            "quantity": quantity
        }
        for product_id, quantity in cart.items()
    ]

    sale = create_sale({"items": items})

    cart.clear()

    return sale