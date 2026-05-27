from backend.models import Product
from backend.models.sale_item import SaleItem
from backend.models.sale import Sale
from backend.extensions import db
from collections import defaultdict
from backend.exceptions import InsufficientStockError, ValidationError, NotFoundError
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import date
from decimal import Decimal
from backend.services.inventory_service import register_inventory_movement


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
        raise ValidationError(
            "Sale must have at least one item"
        )

    grouped_items = defaultdict(float)

    for item in items_data:
        product_id = item.get(
            "product_id"
        )

        quantity = item.get(
            "quantity"
        )

        grouped_items[
            product_id
        ] += quantity

    with db.session.begin():

        # =========================
        # CREATE SALE FIRST
        # =========================

        sale = Sale(
            total_amount=0
        )

        db.session.add(sale)

        # 🔥 GENERA sale.id
        db.session.flush()

        total_amount = 0

        # =========================
        # PROCESS ITEMS
        # =========================

        for (
            product_id,
            quantity,
        ) in grouped_items.items():

            product = (
                db.session.query(
                    Product
                )
                .filter(
                    Product.id
                    == product_id
                )
                .with_for_update()
                .first()
            )

            if not product:
                raise NotFoundError(
                    f"Product {product_id} not found"
                )

            if (
                not product.is_weighted
                and not float(
                    quantity
                ).is_integer()
            ):
                raise ValidationError(
                    f"Product {product.name} must have integer quantity"
                )

            if (
                product.stock
                < quantity
            ):
                raise InsufficientStockError(
                    f"{product.name}"
                )

            unit_price = (
                product.price
            )

            quantity_dec = Decimal(
                str(quantity)
            )

            subtotal = (
                unit_price
                * quantity_dec
            )

            sale_item = SaleItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )

            # =========================
            # INVENTORY MOVEMENT
            # =========================

            register_inventory_movement(
                product=product,
                quantity=-quantity,
                movement_type="SALE",
                reference_id=sale.id,
            )

            sale.items.append(
                sale_item
            )

            total_amount += subtotal

        sale.total_amount = (
            total_amount
        )

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