from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import or_, case

from backend.extensions import db
from backend.models import Product


def normalize_product_name(value):
    if value is None:
        return None

    value = str(value).strip()

    return value.upper() if value else None


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
    normalized_name = normalize_product_name(name) or ""

    return db.session.query(Product).filter(
        Product.name.like(f"%{normalized_name}%")
    ).all()


def get_product_by_barcode(barcode):
    return db.session.query(Product).filter(
        Product.barcode == barcode
    ).first()


def get_product_by_id(product_id):
    return Product.query.get(product_id)


def upsert_product(data):
    if "name" in data:
        data["name"] = normalize_product_name(data.get("name"))

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
        name=normalize_product_name(data.get("name")),
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


def apply_product_sort(query, sort="name_asc"):
    if sort == "name_desc":
        return query.order_by(Product.name.desc())

    if sort == "price_asc":
        return query.order_by(Product.price.asc().nullslast())

    if sort == "price_desc":
        return query.order_by(Product.price.desc().nullslast())

    return query.order_by(Product.name.asc())


def get_paginated_products(page=1, per_page=100, sort="name_asc"):
    query = Product.query

    query = apply_product_sort(query, sort)

    return query.paginate(
        page=page,
        per_page=per_page,
        error_out=False,
    )


def search_products_paginated(query, page=1, per_page=100, sort="name_asc"):
    raw_query = (query or "").strip()
    normalized_name_query = normalize_product_name(raw_query) or ""

    product_query = Product.query.filter(
        or_(
            Product.name.like(f"%{normalized_name_query}%"),
            Product.barcode.ilike(f"%{raw_query}%"),
        )
    )

    relevance_order = case(
        (
            Product.name.like(f"{normalized_name_query}%"),
            0,
        ),
        (
            Product.barcode.ilike(f"{raw_query}%"),
            1,
        ),
        else_=2,
    )

    product_query = product_query.order_by(
        relevance_order,
        Product.name.asc(),
    )

    return product_query.paginate(
        page=page,
        per_page=per_page,
        error_out=False,
    )


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

    for key, value in data.items():
        if key in allowed_fields:
            if key == "name":
                setattr(product, key, normalize_product_name(value))
            else:
                setattr(product, key, value)

    cost = data.get("cost", product.cost)
    margin = data.get("margin", product.margin)

    # Se mantiene desactivado para no sobrescribir precios manuales.
    # if "price" not in data and cost is not None:
    #     product.price = calculate_price(cost, margin)

    db.session.commit()

    return product


def delete_product(product):
    db.session.delete(product)
    db.session.commit()