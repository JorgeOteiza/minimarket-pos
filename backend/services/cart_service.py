from collections import defaultdict
from models import Product
from extensions import db
from exceptions import NotFoundError, ValidationError
from services.sale_service import create_sale

# 🔹 Carrito en memoria (simple)
# { product_id: quantity }
cart = defaultdict(float)


# 🔹 Obtener carrito actual
def get_cart():
    items = []
    total = 0

    for product_id, quantity in cart.items():
        product = db.session.get(Product, product_id)

        if not product:
            continue  # evita romper si borraron producto

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


# 🔹 Agregar producto al carrito
def add_to_cart(product_id, quantity):
    product = db.session.get(Product, product_id)

    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    # 🔹 validación unitario vs granel
    if not product.is_weighted and not float(quantity).is_integer():
        raise ValidationError(
            f"Product {product.name} must have integer quantity"
        )

    cart[product_id] += quantity

    return get_cart()


# 🔹 Remover producto completo del carrito
def remove_from_cart(product_id):
    if product_id not in cart:
        raise NotFoundError(f"Product {product_id} not in cart")

    del cart[product_id]

    return get_cart()


# 🔹 Disminuir cantidad (opcional pero útil)
def decrease_quantity(product_id, quantity):
    if product_id not in cart:
        raise NotFoundError(f"Product {product_id} not in cart")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    cart[product_id] -= quantity

    if cart[product_id] <= 0:
        del cart[product_id]

    return get_cart()


# 🔹 Vaciar carrito
def clear_cart():
    cart.clear()

    return {
        "message": "Cart cleared"
    }


# 🔹 Confirmar venta
def checkout():
    if not cart:
        raise ValidationError("Cart is empty")

    items = []

    for product_id, quantity in cart.items():
        items.append({
            "product_id": product_id,
            "quantity": quantity
        })

    # 🔹 usar lógica robusta ya creada
    sale = create_sale({"items": items})

    # 🔹 limpiar carrito después de venta
    cart.clear()

    return sale