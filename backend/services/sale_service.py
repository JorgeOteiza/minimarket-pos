from models import Product
from models.sale import Sale
from models.sale_item import SaleItem
from extensions import db
from collections import defaultdict
from exceptions import InsufficientStockError, ValidationError, NotFoundError
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import date


def get_all_sales():
    return db.session.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product)
    ).all()


def get_sale_by_id(id):
    return db.session.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product)
    ).filter(Sale.id == id).first()


def create_sale(data):
    items_data = data.get("items")

    if not items_data:
        raise ValidationError("Sale must have at least one item")

    # 🔹 agrupar productos repetidos
    grouped_items = defaultdict(float)
    for item in items_data:
        product_id = item.get("product_id")
        quantity = item.get("quantity")

        grouped_items[product_id] += quantity

    # 🔥 transacción atómica
    with db.session.begin():

        sale = Sale(total_amount=0)
        total_amount = 0

        for product_id, quantity in grouped_items.items():

            product = db.session.get(Product, product_id)

            # 🔍 validar existencia
            if not product:
                raise NotFoundError(f"Product {product_id} not found")

            # 🔹 validación unitario vs granel
            if not product.is_weighted and not float(quantity).is_integer():
                raise ValidationError(
                    f"Product {product.name} must have integer quantity"
                )

            # 🔍 validar stock
            if product.stock < quantity:
                raise InsufficientStockError(
                    f"Not enough stock for {product.name}"
                )

            # 💰 cálculo
            unit_price = product.price
            subtotal = float(unit_price) * quantity

            # 📦 crear item
            sale_item = SaleItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal
            )

            # 🔻 actualizar stock
            product.stock -= quantity

            # 🔗 relación
            sale.items.append(sale_item)

            total_amount += subtotal

        sale.total_amount = total_amount

        db.session.add(sale)

    return sale


def get_today_sales_summary():
    today = date.today()

    result = db.session.query(
        func.count(Sale.id),
        func.coalesce(func.sum(Sale.total_amount), 0)
    ).filter(
        func.date(Sale.created_at) == today
    ).one()

    return {
        "count": result[0],
        "total": float(result[1])
    }