from models import Product
from models.sale import Sale
from extensions import db


def create_sale(data):
    product = Product.query.get(data["product_id"])

    if not product:
        raise Exception("Product not found")

    if product.stock < data["quantity"]:
        raise Exception("Not enough stock")

    total_price = float(product.price) * data["quantity"]

    product.stock -= data["quantity"]

    sale = Sale(
        product_id=product.id,
        quantity=data["quantity"],
        total_price=total_price
    )

    db.session.add(sale)
    db.session.commit()

    return sale