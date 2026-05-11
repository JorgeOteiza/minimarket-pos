from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import csv
import logging

from sqlalchemy.exc import SQLAlchemyError

from backend.extensions import db
from backend.models import Product, Category


logger = logging.getLogger(__name__)

MONEY_QUANT = Decimal("0.01")
DEFAULT_MARGIN = Decimal("0.30")


class ProductImportError(Exception):
    pass


def import_products_from_csv(file_path: str):
    result = {
        "created": 0,
        "updated": 0,
        "skipped": 0,
        "errors": [],
    }

    with open(file_path, newline="", encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile)

        _validate_headers(reader.fieldnames)

        for row_number, row in enumerate(reader, start=2):
            try:
                with db.session.begin_nested():
                    data = _parse_row(row)
                    category_name = data.pop("category", None)

                    if category_name:
                        category = _get_or_create_category(category_name)
                        data["category_id"] = category.id

                    product = _find_product(data)

                    if product:
                        update_data = _clean_update_data(data)
                        product.update_from_dict(update_data)
                        result["updated"] += 1
                    else:
                        product = Product(**data)
                        db.session.add(product)
                        result["created"] += 1

            except Exception as exc:
                result["skipped"] += 1
                result["errors"].append({
                    "row": row_number,
                    "error": str(exc),
                    "data": row,
                })
                logger.warning("Error importando fila %s: %s", row_number, exc)

        try:
            db.session.commit()
        except SQLAlchemyError as exc:
            db.session.rollback()
            raise ProductImportError(f"Error guardando importación: {exc}") from exc

    return result


def _validate_headers(headers):
    headers = set(headers or [])

    required = {"name", "stock"}
    missing = required - headers

    if missing:
        raise ProductImportError(
            f"Faltan columnas obligatorias: {', '.join(sorted(missing))}"
        )


def _parse_row(row: dict) -> dict:
    name = _clean(row.get("name"))
    if not name:
        raise ProductImportError("El nombre del producto es obligatorio")

    barcode = _clean(row.get("barcode"))

    cost = _parse_money(row.get("cost"), "cost", required=False)
    price = _parse_money(row.get("price"), "price", required=False)

    if cost is None and price is None:
        raise ProductImportError("El producto debe tener cost o price")

    margin = _parse_margin(row.get("margin"))

    stock = _parse_int(row.get("stock"), "stock", default=0, min_value=0)
    
    pack_units = _parse_int(
    row.get("pack_units"),
    "pack_units",
    default=stock,
    min_value=1,
    )
    
    min_stock = _parse_int(row.get("min_stock"), "min_stock", default=5, min_value=0)

    return {
        "name": name,
        "barcode": barcode,
        "pack_units": pack_units,
        "cost": cost,
        "price": price,
        "stock": stock,
        "min_stock": min_stock,
        "is_weighted": _parse_bool(row.get("is_weighted")),
        "weight": _parse_float(row.get("weight")),
        "margin": float(margin),
        "category": _clean(row.get("category")),
    }


def _clean_update_data(data: dict) -> dict:
    """
    Evita borrar datos importantes cuando un CSV trae campos vacíos.
    Ejemplo:
    - Inventario manual trae cost vacío, pero price lleno.
    - Factura trae price vacío, pero cost lleno.
    """
    protected_nullable_fields = {
        "barcode",
        "cost",
        "price",
        "weight",
        "category_id",
    }

    return {
        key: value
        for key, value in data.items()
        if not (key in protected_nullable_fields and value is None)
    }


def _find_product(data: dict):
    barcode = data.get("barcode")

    if barcode:
        return Product.query.filter_by(barcode=barcode).first()

    name = data.get("name")

    if name:
        return Product.query.filter(
            db.func.lower(Product.name) == name.lower()
        ).first()

    return None


def _get_or_create_category(name: str):
    normalized_name = name.strip().lower()

    category = Category.query.filter(
        db.func.lower(Category.name) == normalized_name
    ).first()

    if category:
        return category

    category = Category(name=name.strip())
    db.session.add(category)
    db.session.flush()

    return category


def _calculate_price(cost: Decimal, margin: Decimal) -> Decimal:
    price = cost * (Decimal("1") + margin)
    return price.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)


def _clean(value):
    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return value


def _parse_money(value, field_name: str, required: bool = False):
    value = _clean(value)

    if value is None:
        if required:
            raise ProductImportError(f"{field_name} es obligatorio")
        return None

    try:
        normalized = (
            value.replace("$", "")
            .replace(".", "")
            .replace(",", ".")
            .strip()
        )

        number = Decimal(normalized)

        if number < 0:
            raise ProductImportError(f"{field_name} no puede ser negativo")

        return number.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)

    except InvalidOperation:
        raise ProductImportError(f"{field_name} inválido: {value}")


def _parse_margin(value):
    value = _clean(value)

    if value is None:
        return DEFAULT_MARGIN

    try:
        normalized = value.replace("%", "").replace(",", ".").strip()
        margin = Decimal(normalized)

        if margin > 1:
            margin = margin / Decimal("100")

        if margin < 0:
            raise ProductImportError("margin no puede ser negativo")

        return margin

    except InvalidOperation:
        raise ProductImportError(f"margin inválido: {value}")


def _parse_int(value, field_name: str, default: int = 0, min_value: int = 0):
    value = _clean(value)

    if value is None:
        return default

    try:
        number = int(Decimal(value.replace(",", ".")))
    except InvalidOperation:
        raise ProductImportError(f"{field_name} inválido: {value}")

    if number < min_value:
        raise ProductImportError(f"{field_name} no puede ser menor que {min_value}")

    return number


def _parse_float(value):
    value = _clean(value)

    if value is None:
        return None

    return float(value.replace(",", "."))


def _parse_bool(value):
    value = _clean(value)

    if value is None:
        return False

    return value.lower() in {"true", "1", "yes", "y", "si", "sí"}