from datetime import date, timedelta

from sqlalchemy import desc, func

from backend.extensions import db
from backend.models import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def safe_average(total, count):
    if not count:
        return 0

    return float(total) / count


def safe_profit_per_unit(price, cost, pack_units, iva=0.19):
    if price is None or cost is None or not pack_units or pack_units <= 0:
        return None

    unit_cost = float(cost) / float(pack_units)
    unit_cost_with_iva = unit_cost * (1 + iva)

    return float(price) - unit_cost_with_iva


def get_analytics_summary():
    today = date.today()
    last_30_days = today - timedelta(days=30)
    no_movement_since = today - timedelta(days=90)

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

    units_sold_30_days = (
        db.session.query(func.coalesce(func.sum(SaleItem.quantity), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(func.date(Sale.created_at) >= last_30_days)
        .scalar()
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

    low_stock_query = db.session.query(Product).filter(
        Product.stock <= Product.min_stock
    )

    products_without_price_query = db.session.query(Product).filter(
        Product.price.is_(None)
    )

    low_stock_count = low_stock_query.count()
    products_without_price_count = products_without_price_query.count()

    low_stock_products = (
        low_stock_query
        .order_by(Product.stock.asc())
        .limit(10)
        .all()
    )

    products_without_price = (
        products_without_price_query
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

    profitable_products_rows = (
        db.session.query(
            Product.id,
            Product.name,
            Product.price,
            Product.cost,
            Product.pack_units,
            func.sum(SaleItem.quantity).label("quantity_sold"),
            func.sum(SaleItem.subtotal).label("total_sold"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(func.date(Sale.created_at) >= last_30_days)
        .filter(Product.price.isnot(None))
        .filter(Product.cost.isnot(None))
        .filter(Product.pack_units.isnot(None))
        .filter(Product.pack_units > 0)
        .group_by(
            Product.id,
            Product.name,
            Product.price,
            Product.cost,
            Product.pack_units,
        )
        .all()
    )

    profitable_products = []

    for row in profitable_products_rows:
        profit_per_unit = safe_profit_per_unit(
            row.price,
            row.cost,
            row.pack_units,
        )

        if profit_per_unit is None:
            continue

        quantity_sold = float(row.quantity_sold or 0)
        price = float(row.price)
        unit_cost_estimated = float(row.cost) / float(row.pack_units)
        estimated_total_profit = profit_per_unit * quantity_sold

        margin_percent = (
            (profit_per_unit / price) * 100
            if price > 0
            else 0
        )

        profitable_products.append(
            {
                "id": row.id,
                "name": row.name,
                "price": price,
                "unit_cost_estimated": unit_cost_estimated,
                "profit_per_unit": profit_per_unit,
                "margin_percent": margin_percent,
                "quantity_sold": quantity_sold,
                "total_sold": float(row.total_sold or 0),
                "estimated_total_profit": estimated_total_profit,
            }
        )

    profitable_products = sorted(
        profitable_products,
        key=lambda item: item["estimated_total_profit"],
        reverse=True,
    )[:10]
    
    most_profitable_product = (
    profitable_products[0]
    if profitable_products
    else None
)

    last_sale_subquery = (
        db.session.query(
            SaleItem.product_id.label("product_id"),
            func.max(func.date(Sale.created_at)).label("last_sale_date"),
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .group_by(SaleItem.product_id)
        .subquery()
    )

    no_movement_query = (
        db.session.query(
            Product.id,
            Product.name,
            Product.barcode,
            Product.stock,
            Product.price,
            last_sale_subquery.c.last_sale_date,
        )
        .outerjoin(
            last_sale_subquery,
            last_sale_subquery.c.product_id == Product.id,
        )
        .filter(
            (last_sale_subquery.c.last_sale_date.is_(None))
            | (last_sale_subquery.c.last_sale_date < no_movement_since)
        )
    )

    products_without_movement_count = no_movement_query.count()

    products_without_movement = (
        no_movement_query
        .order_by(
            last_sale_subquery.c.last_sale_date.asc().nullsfirst(),
            Product.name.asc(),
        )
        .limit(15)
        .all()
    )

    today_sales_count = today_sales[0]
    today_total_sales = float(today_sales[1])

    last_30_sales_count = last_30_sales[0]
    last_30_total_sales = float(last_30_sales[1])

    top_product = top_products[0] if top_products else None

    return {
        "today": {
            "sales_count": today_sales_count,
            "total_sales": today_total_sales,
            "average_ticket": safe_average(today_total_sales, today_sales_count),
        },
        "last_30_days": {
            "sales_count": last_30_sales_count,
            "total_sales": last_30_total_sales,
            "average_ticket": safe_average(
                last_30_total_sales,
                last_30_sales_count,
            ),
            "total_units_sold": float(units_sold_30_days or 0),
            "average_daily_sales": safe_average(last_30_total_sales, 30),
        },
        "inventory_alerts": {
            "low_stock_count": low_stock_count,
            "products_without_price_count": products_without_price_count,
            "products_without_movement_count": products_without_movement_count,
            "no_movement_days": 90,
        },
        "top_product": {
            "id": top_product.id,
            "name": top_product.name,
            "quantity_sold": float(top_product.quantity_sold or 0),
            "total_sold": float(top_product.total_sold or 0),
        }
        if top_product
        else None,
        "most_profitable_product": most_profitable_product,
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
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
                "min_stock": product.min_stock,
            }
            for product in low_stock_products
        ],
        "products_without_price": [
            {
                "id": product.id,
                "name": product.name,
                "barcode": product.barcode,
            }
            for product in products_without_price
        ],
        "products_without_movement": [
            {
                "id": row.id,
                "name": row.name,
                "barcode": row.barcode,
                "stock": row.stock,
                "price": float(row.price) if row.price is not None else None,
                "last_sale_date": (
                    str(row.last_sale_date) if row.last_sale_date else None
                ),
            }
            for row in products_without_movement
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
        "profitable_products": profitable_products,
    }