from datetime import date, timedelta

from sqlalchemy import func, desc

from backend.extensions import db
from backend.models import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def get_analytics_summary():
    today = date.today()
    last_30_days = today - timedelta(days=30)

    today_sales = (
        db.session.query(
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.total_amount), 0),
        )
        .filter(func.date(Sale.created_at) == today)
        .one()
    )

    last_30_sales = (
        db.session.query(
            func.count(Sale.id),
            func.coalesce(func.sum(Sale.total_amount), 0),
        )
        .filter(func.date(Sale.created_at) >= last_30_days)
        .one()
    )

    sales_by_day_rows = (
        db.session.query(
            func.date(Sale.created_at).label("sale_date"),
            func.count(Sale.id).label("sales_count"),
            func.coalesce(func.sum(Sale.total_amount), 0).label("total_sales"),
        )
        .filter(func.date(Sale.created_at) >= last_30_days)
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at).asc())
        .all()
    )

    low_stock_products = (
        db.session.query(Product)
        .filter(Product.stock <= Product.min_stock)
        .order_by(Product.stock.asc())
        .limit(10)
        .all()
    )

    products_without_price = (
        db.session.query(Product)
        .filter(Product.price.is_(None))
        .order_by(Product.id.desc())
        .limit(10)
        .all()
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
        .filter(func.date(Sale.created_at) >= last_30_days)
        .group_by(Product.id, Product.name)
        .order_by(desc("quantity_sold"))
        .limit(10)
        .all()
    )

    return {
        "today": {
            "sales_count": today_sales[0],
            "total_sales": float(today_sales[1]),
        },
        "last_30_days": {
            "sales_count": last_30_sales[0],
            "total_sales": float(last_30_sales[1]),
        },
        "sales_by_day": [
            {
                "date": str(row.sale_date),
                "sales_count": row.sales_count,
                "total_sales": float(row.total_sales or 0),
            }
            for row in sales_by_day_rows
        ],
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock,
                "min_stock": p.min_stock,
            }
            for p in low_stock_products
        ],
        "products_without_price": [
            {
                "id": p.id,
                "name": p.name,
                "barcode": p.barcode,
            }
            for p in products_without_price
        ],
        "top_products": [
            {
                "id": row.id,
                "name": row.name,
                "quantity_sold": float(row.quantity_sold or 0),
                "total_sold": float(row.total_sold or 0),
            }
            for row in top_products
        ],
    }