from backend.models import Product
from backend.models.cart import Cart
from backend.models.cart_item import CartItem
from backend.extensions import db
from backend.exceptions import NotFoundError, ValidationError
from backend.services.sale_service import create_sale


# 🔹 siempre usamos un solo carrito
def get_or_create_cart():
    cart = db.session.query(Cart).first()

    if not cart:
        cart = Cart()
        db.session.add(cart)
        db.session.commit()

    return cart


def build_cart_response(cart: Cart):
    items = []
    total = 0

    for item in cart.items:
        product = db.session.get(Product, item.product_id)

        if not product:
            continue

        if product.price is None:
            unit_price = 0
            subtotal = 0
        else:
            unit_price = float(product.price)
            subtotal = unit_price * item.quantity

        items.append({
            "product_id": product.id,
            "name": product.name,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
            "has_price": product.price is not None,
        })

        total += subtotal

    return {
        "items": items,
        "total": total
    }

# 🔹 GET
def get_cart():
    cart = get_or_create_cart()
    return build_cart_response(cart)


# 🔹 ADD
def add_to_cart(product_id, quantity):
    cart = get_or_create_cart()

    product = db.session.get(Product, product_id)

    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    if not product.is_weighted and not float(quantity).is_integer():
        raise ValidationError(
            f"Product {product.name} must have integer quantity"
        )

    cart_item = next(
        (item for item in cart.items if item.product_id == product_id),
        None
    )

    new_quantity = quantity
    if cart_item:
        new_quantity += cart_item.quantity

    if product.stock < new_quantity:
        raise ValidationError(
            f"Not enough stock for {product.name}. Available: {product.stock}"
        )

    if cart_item:
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(cart_item)

    db.session.commit()

    return build_cart_response(cart)


# 🔹 REMOVE
def remove_from_cart(product_id):
    cart = get_or_create_cart()

    cart_item = next(
        (item for item in cart.items if item.product_id == product_id),
        None
    )

    if not cart_item:
        raise NotFoundError(f"Product {product_id} not in cart")

    db.session.delete(cart_item)
    db.session.commit()

    return build_cart_response(cart)


# 🔹 DECREASE
def decrease_quantity(product_id, quantity):
    cart = get_or_create_cart()

    cart_item = next(
        (item for item in cart.items if item.product_id == product_id),
        None
    )

    if not cart_item:
        raise NotFoundError(f"Product {product_id} not in cart")

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    cart_item.quantity -= quantity

    if cart_item.quantity <= 0:
        db.session.delete(cart_item)

    db.session.commit()

    return build_cart_response(cart)


# 🔹 CLEAR
def clear_cart():
    cart = get_or_create_cart()

    for item in cart.items:
        db.session.delete(item)

    db.session.commit()

    return build_cart_response(cart)


# 🔹 CHECKOUT
def checkout():
    cart = get_or_create_cart()

    if not cart.items:
        raise ValidationError("Cart is empty")

    items = [
        {
            "product_id": item.product_id,
            "quantity": item.quantity
        }
        for item in cart.items
    ]

    sale = create_sale({"items": items})

    # 🔥 limpiar carrito
    for item in cart.items:
        db.session.delete(item)

    db.session.commit()

    return sale