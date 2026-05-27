from backend.models import Product
from backend.extensions import db
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy import or_


# 🔹 helper: calcular precio desde costo + margen

def calculate_price(cost, margin):
    if cost is None:
        return None

    cost = Decimal(str(cost))
    margin = Decimal(str(margin))

    return (cost * (Decimal("1") + margin)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


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

def upsert_product(data):
    product = Product.query.filter_by(
        barcode=data.get("barcode")
    ).first()

    if product:
        product.update_from_dict(data)
    else:
        product = Product(**data)
        db.session.add(product)

    return product

def create_product(data):
    product = Product(
        name=data.get("name"),
        price=data.get("price"),
        barcode=data.get("barcode"),
        pack_units=data.get("pack_units"),
        cost=data.get("cost"),
        stock=data.get("stock", 0),
        min_stock=data.get("min_stock", 5),
        is_weighted=data.get("is_weighted", False),
        weight=data.get("weight"),
        margin=data.get("margin", 0.3),
        category_id=data.get("category_id"),
    )

    db.session.add(product)
    db.session.commit()

    return product

def get_paginated_products(page=1, per_page=100):
    return (
        Product.query
        .order_by(Product.id.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )


def search_products_paginated(query, page=1, per_page=100):
    return (
        Product.query
        .filter(
            or_(
                Product.name.ilike(f"%{query}%"),
                Product.barcode.ilike(f"%{query}%"),
            )
        )
        .order_by(Product.id.desc())
        .paginate(
            page=page,
            per_page=per_page,
            error_out=False,
        )
    )


# 🔹 UPDATE
def update_product(product, data):
    allowed_fields = {
        "name",
        "price",
        "barcode",
        "pack_units",
        "cost",
        "min_stock",
        "is_weighted",
        "weight",
        "margin",
        "category_id",
    }

    # 🔥 aplicar cambios básicos
    for key, value in data.items():
        if key in allowed_fields:
            setattr(product, key, value)

    # 🔥 lógica de negocio post-update
    cost = data.get("cost", product.cost)
    margin = data.get("margin", product.margin)

    # ⚠️ solo recalculamos si NO viene price explícito
    # if "price" not in data and cost is not None:
    #     product.price = calculate_price(cost, margin)

    db.session.commit()

    return product


def delete_product(product):
    db.session.delete(product)
    db.session.commit()