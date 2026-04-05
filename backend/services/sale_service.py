from models import Product
from models.sale import Sale
from models.sale_item import SaleItem
from extensions import db
from collections import defaultdict
from exceptions import InsufficientStockError, ValidationError, NotFoundError
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import date, datetime


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

    # 🔹 agrupar items duplicados
    grouped_items = defaultdict(float)

    for item in items_data:
        grouped_items[item["product_id"]] += item["quantity"]

    sale = Sale(total_amount=0)
    total_amount = 0

    try:
        with db.session.begin():

            for product_id, quantity in grouped_items.items():

                product = db.session.get(Product, product_id)

                if not product:
                    raise NotFoundError(f"Product {product_id} not found")

                # 🔹 validación unitario vs granel
                if not product.is_weighted and not float(quantity).is_integer():
                    raise ValidationError(
                        f"Product {product.name} must have integer quantity"
                    )

                # 🔹 validación stock
                if product.stock < quantity:
                    raise InsufficientStockError(
                        f"Not enough stock for {product.name}"
                    )

                unit_price = product.price
                subtotal = float(unit_price) * quantity

                sale_item = SaleItem(
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=unit_price,
                    subtotal=subtotal
                )

                # 🔻 actualizar stock
                product.stock -= quantity

                sale.items.append(sale_item)

                total_amount += subtotal

            sale.total_amount = total_amount

            db.session.add(sale)

        return sale

    except Exception:
        # rollback automático ya manejado por SQLAlchemy
        raise


def get_today_sales_summary():
    today = date.today()

    sales = db.session.query(Sale).filter(
        func.date(Sale.created_at) == today
    ).all()

    total_amount = sum(float(s.total_amount) for s in sales)

    return {
        "total": total_amount,
        "count": len(sales)
    }
    
    today = datetime.utcnow().date()