from collections import defaultdict
from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import joinedload

from backend.extensions import db
from backend.exceptions import InsufficientStockError, NotFoundError, ValidationError
from backend.models import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.services.inventory_service import register_inventory_movement


def get_all_sales():
    return (
        db.session.query(Sale)
        .options(joinedload(Sale.items).joinedload(SaleItem.product))
        .all()
    )


def get_sale_by_id(id):
    return (
        db.session.query(Sale)
        .options(joinedload(Sale.items).joinedload(SaleItem.product))
        .filter(Sale.id == id)
        .first()
    )


def _create_sale(data):
    items_data = data.get("items")

    if not items_data:
        raise ValidationError("La venta debe tener al menos un producto.")

    grouped_items = defaultdict(float)

    for item in items_data:
        product_id = item.get("product_id")
        quantity = item.get("quantity")

        if product_id is None:
            raise ValidationError("El producto es obligatorio.")

        if quantity is None:
            raise ValidationError("La cantidad es obligatoria.")

        grouped_items[product_id] += quantity

    sale = Sale(total_amount=0)
    db.session.add(sale)
    db.session.flush()

    total_amount = Decimal("0")

    for product_id, quantity in grouped_items.items():
        product = (
            db.session.query(Product)
            .filter(Product.id == product_id)
            .with_for_update()
            .first()
        )

        if not product:
            raise NotFoundError("No se encontró el producto solicitado.")

        if not product.is_weighted and not float(quantity).is_integer():
            raise ValidationError(f"El producto {product.name} debe venderse en unidades enteras.")

        if product.stock < quantity:
            raise InsufficientStockError(
    f"Stock insuficiente para {product.name}. Disponible: {product.stock} unidades."
)

        if product.price is None:
            raise ValidationError(f"El producto {product.name} no tiene precio registrado.")

        quantity_dec = Decimal(str(quantity))
        unit_price = Decimal(str(product.price))
        subtotal = unit_price * quantity_dec

        sale_item = SaleItem(
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )

        register_inventory_movement(
            product=product,
            quantity=-quantity,
            movement_type="SALE",
            reference_id=sale.id,
        )

        sale.items.append(sale_item)
        total_amount += subtotal

    sale.total_amount = total_amount

    return sale


def create_sale(data):
    return _create_sale(data)


def get_today_sales_summary():
    today = date.today()

    result = (
        db.session.query(
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.total_amount), 0),
        )
        .filter(func.date(Sale.created_at) == today)
        .one()
    )

    return {
        "count": result[0],
        "total": float(result[1]),
    }