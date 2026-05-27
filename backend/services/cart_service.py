from backend.models import Product
from backend.models.cart import Cart
from backend.models.cart_item import CartItem
from backend.extensions import db
from backend.exceptions import NotFoundError, ValidationError
from backend.services.sale_service import create_sale


def get_or_create_cart():
    cart = db.session.query(Cart).first()

    if not cart:
        cart = Cart()
        db.session.add(cart)
        db.session.commit()

    return cart


def get_cart_item(cart_id, product_id):
    return (
        db.session.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        .first()
    )


def validate_quantity(product, quantity):
    quantity = float(quantity)

    if quantity <= 0:
        raise ValidationError("Quantity must be greater than 0")

    if not product.is_weighted and not quantity.is_integer():
        raise ValidationError(f"Product {product.name} must have integer quantity")

    return quantity


def build_cart_response(cart: Cart):
    items = []
    total = 0

    cart_items = (
        db.session.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .order_by(CartItem.id.asc())
        .all()
    )

    for item in cart_items:
        product = db.session.get(Product, item.product_id)

        if not product:
            continue

        has_price = product.price is not None
        unit_price = float(product.price) if has_price else 0
        subtotal = unit_price * item.quantity

        items.append({
            "product_id": product.id,
            "name": product.name,
            "quantity": int(item.quantity)
            if float(item.quantity).is_integer()
            else item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
            "has_price": has_price,
        })

        total += subtotal

    return {
        "items": items,
        "total": total,
    }


def get_cart():
    cart = get_or_create_cart()
    return build_cart_response(cart)


def add_to_cart(product_id, quantity):
    cart = get_or_create_cart()
    product = db.session.get(Product, product_id)

    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    quantity = validate_quantity(product, quantity)

    cart_item = get_cart_item(cart.id, product_id)

    current_quantity = cart_item.quantity if cart_item else 0
    new_quantity = current_quantity + quantity

    if product.stock < new_quantity:
        raise ValidationError(
            f"Not enough stock for {product.name}. Available: {product.stock}"
        )

    if cart_item:
        cart_item.quantity = new_quantity
    else:
        db.session.add(
            CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
            )
        )

    db.session.commit()
    return build_cart_response(cart)


def remove_from_cart(product_id):
    cart = get_or_create_cart()
    cart_item = get_cart_item(cart.id, product_id)

    if not cart_item:
        raise NotFoundError(f"Product {product_id} not in cart")

    db.session.delete(cart_item)
    db.session.commit()

    return build_cart_response(cart)


def decrease_quantity(product_id, quantity):
    cart = get_or_create_cart()
    product = db.session.get(Product, product_id)

    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    quantity = validate_quantity(product, quantity)

    cart_item = get_cart_item(cart.id, product_id)

    if not cart_item:
        raise NotFoundError(f"Product {product_id} not in cart")

    cart_item.quantity -= quantity

    if cart_item.quantity <= 0:
        db.session.delete(cart_item)

    db.session.commit()
    return build_cart_response(cart)


def clear_cart():
    cart = get_or_create_cart()

    db.session.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.session.commit()

    return build_cart_response(cart)


def checkout():
    cart = get_or_create_cart()

    cart_items = (
        db.session.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    if not cart_items:
        raise ValidationError("Cart is empty")

    items = [
        {
            "product_id": item.product_id,
            "quantity": item.quantity,
        }
        for item in cart_items
    ]

    with db.session.begin():

        sale = create_sale({
            "items": items
        })

        (
            db.session.query(CartItem)
            .filter(
                CartItem.cart_id == cart.id
            )
            .delete()
        )

    return sale