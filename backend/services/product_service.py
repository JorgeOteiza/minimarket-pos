from backend.models import Product
from backend.extensions import db


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


def create_product(data):
    product = Product(
        name=data.get("name"),
        price=data.get("price"),
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

    return product


def update_product(product, data):
    product.name = data.get("name", product.name)
    product.price = data.get("price", product.price)
    product.barcode = data.get("barcode", product.barcode)
    product.cost = data.get("cost", product.cost)
    product.stock = data.get("stock", product.stock)
    product.min_stock = data.get("min_stock", product.min_stock)
    product.is_weighted = data.get("is_weighted", product.is_weighted)
    product.weight = data.get("weight", product.weight)
    product.margin = data.get("margin", product.margin)

    db.session.commit()

    return product


def delete_product(product):
    db.session.delete(product)
    db.session.commit()