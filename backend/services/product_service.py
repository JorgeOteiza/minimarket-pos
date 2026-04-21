from backend.models import Product
from backend.extensions import db


# 🔹 helper: calcular precio desde costo + margen
def calculate_price(cost, margin):
    if cost is None:
        return None
    return round(cost * (1 + margin), 2)


def get_all_products():
    return Product.query.all()


def search_products_by_name(name):
    return db.session.query(Product).filter(
        Product.name.ilike(f"%{name}%")
    ).all()


def get_product_by_barcode(barcode):
    return db.session.query(Product).filter(
        Product.barcode == barcode
    ).first()


def get_product_by_id(product_id):
    return Product.query.get(product_id)


# 🔹 CREATE
def create_product(data):
    cost = data.get("cost")
    margin = data.get("margin", 0.3)
    price = data.get("price")

    # 🔥 lógica de negocio
    if price is None and cost is not None:
        price = calculate_price(cost, margin)

    product = Product(
        name=data.get("name"),
        price=price,
        barcode=data.get("barcode"),
        cost=cost,
        stock=data.get("stock", 0),
        min_stock=data.get("min_stock", 5),
        is_weighted=data.get("is_weighted", False),
        weight=data.get("weight"),
        margin=margin,
    )

    db.session.add(product)
    db.session.commit()

    return product


# 🔹 UPDATE
def update_product(product, data):
    allowed_fields = {
        "name",
        "price",
        "barcode",
        "cost",
        "stock",
        "min_stock",
        "is_weighted",
        "weight",
        "margin",
    }

    # 🔥 aplicar cambios básicos
    for key, value in data.items():
        if key in allowed_fields:
            setattr(product, key, value)

    # 🔥 lógica de negocio post-update
    cost = data.get("cost", product.cost)
    margin = data.get("margin", product.margin)

    # ⚠️ solo recalculamos si NO viene price explícito
    if "price" not in data and cost is not None:
        product.price = calculate_price(cost, margin)

    db.session.commit()

    return product


def delete_product(product):
    db.session.delete(product)
    db.session.commit()