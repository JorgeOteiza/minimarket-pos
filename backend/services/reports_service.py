from datetime import date, datetime, time, timedelta

from sqlalchemy import desc, func

from backend.exceptions import ValidationError
from backend.extensions import db
from backend.models import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


VALID_PERIODS = {"today", "week", "month", "semester", "year"}


def safe_average(total, count):
    if not count:
        return 0

    return float(total) / count


def get_period_range(period):
    today = date.today()

    if period == "today":
        start_date = today
        end_date = today + timedelta(days=1)
        label = "Hoy"

    elif period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=7)
        label = "Esta semana"

    elif period == "month":
        start_date = today.replace(day=1)

        if today.month == 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1)
        else:
            end_date = today.replace(month=today.month + 1, day=1)

        label = "Este mes"

    elif period == "semester":
        if today.month <= 6:
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 7, 1)
            label = "Primer semestre"
        else:
            start_date = date(today.year, 7, 1)
            end_date = date(today.year + 1, 1, 1)
            label = "Segundo semestre"

    elif period == "year":
        start_date = date(today.year, 1, 1)
        end_date = date(today.year + 1, 1, 1)
        label = "Este año"

    else:
        raise ValidationError("Periodo de reporte inválido")

    start_datetime = datetime.combine(start_date, time.min)
    end_datetime = datetime.combine(end_date, time.min)

    return {
        "period": period,
        "label": label,
        "start_date": start_date,
        "end_date": end_date - timedelta(days=1),
        "start_datetime": start_datetime,
        "end_datetime": end_datetime,
    }


def get_sales_report(period="today"):
    if period not in VALID_PERIODS:
        raise ValidationError("Periodo de reporte inválido")

    period_data = get_period_range(period)
    start_datetime = period_data["start_datetime"]
    end_datetime = period_data["end_datetime"]

    sales_summary = (
        db.session.query(
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.total_amount), 0),
        )
        .filter(Sale.created_at >= start_datetime)
        .filter(Sale.created_at < end_datetime)
        .one()
    )

    units_sold = (
        db.session.query(func.coalesce(func.sum(SaleItem.quantity), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= start_datetime)
        .filter(Sale.created_at < end_datetime)
        .scalar()
    )

    top_products = (
        db.session.query(
            Product.id,
            Product.name,
            func.sum(SaleItem.quantity).label("quantity_sold"),
            func.sum(SaleItem.subtotal).label("total_sold"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= start_datetime)
        .filter(Sale.created_at < end_datetime)
        .group_by(Product.id, Product.name)
        .order_by(desc("quantity_sold"))
        .limit(10)
        .all()
    )

    recent_sales = (
        db.session.query(Sale)
        .filter(Sale.created_at >= start_datetime)
        .filter(Sale.created_at < end_datetime)
        .order_by(Sale.created_at.desc())
        .limit(20)
        .all()
    )

    sales_count = sales_summary[0]
    total_sales = float(sales_summary[1] or 0)

    return {
        "period": {
            "key": period_data["period"],
            "label": period_data["label"],
            "start_date": str(period_data["start_date"]),
            "end_date": str(period_data["end_date"]),
        },
        "summary": {
            "sales_count": sales_count,
            "total_sales": total_sales,
            "average_ticket": safe_average(total_sales, sales_count),
            "total_units_sold": float(units_sold or 0),
        },
        "top_products": [
            {
                "id": row.id,
                "name": row.name,
                "quantity_sold": float(row.quantity_sold or 0),
                "total_sold": float(row.total_sold or 0),
            }
            for row in top_products
        ],
        "recent_sales": [
            {
                "id": sale.id,
                "created_at": sale.created_at.isoformat()
                if sale.created_at
                else None,
                "total_amount": float(sale.total_amount or 0),
                "items_count": len(sale.items),
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_name": item.product.name
                        if item.product
                        else "Producto eliminado",
                        "quantity": float(item.quantity or 0),
                        "unit_price": float(item.unit_price or 0),
                        "subtotal": float(item.subtotal or 0),
                    }
                    for item in sale.items
                ],
            }
            for sale in recent_sales
        ],
    }