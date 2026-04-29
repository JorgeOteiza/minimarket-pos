from decimal import Decimal
import csv

from backend.extensions import db
from backend.models import Product


class ProductImportError(Exception):
    pass


def import_products_from_csv(file_path: str):
    created = 0
    updated = 0
    errors = []

    with db.session.begin():
        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for i, row in enumerate(reader, start=1):
                try:
                    data = _parse_row(row)

                    product = Product.query.filter_by(
                        barcode=data["barcode"]
                    ).first()

                    if product:
                        product.update_from_dict(data)
                        updated += 1
                    else:
                        product = Product(**data)
                        db.session.add(product)
                        created += 1

                except Exception as e:
                    errors.append({
                        "row": i,
                        "error": str(e),
                        "data": row
                    })

    return {
        "created": created,
        "updated": updated,
        "errors": errors
    }


def _parse_row(row: dict) -> dict:
    try:
        return {
            "name": row["name"].strip(),
            "barcode": row.get("barcode") or None,
            "price": Decimal(row["price"]),
            "cost": Decimal(row["cost"]) if row.get("cost") else None,
            "stock": int(row.get("stock", 0)),
            "min_stock": int(row.get("min_stock", 5)),
            "is_weighted": str(row.get("is_weighted", "false")).lower() == "true",
            "weight": float(row["weight"]) if row.get("weight") else None,
            "margin": float(row.get("margin", 0.3)),
            "category_id": int(row["category_id"]) if row.get("category_id") else None,
        }
    except Exception as e:
        raise ProductImportError(f"Invalid row: {row} - {str(e)}")