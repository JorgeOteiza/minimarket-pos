from decimal import Decimal

from backend.extensions import db
from backend.exceptions import NotFoundError, ValidationError, ConflictError
from backend.models.bulk_product import BulkProduct
from backend.models.bulk_restock import BulkRestock


DEFAULT_SALE_MARGIN = 0.4


def get_bulk_products():
    return (
        db.session.query(BulkProduct)
        .filter(BulkProduct.active.is_(True))
        .order_by(BulkProduct.name.asc())
        .all()
    )


def get_bulk_product_by_barcode(barcode):
    return (
        db.session.query(BulkProduct)
        .filter(BulkProduct.barcode == barcode)
        .first()
    )


def get_bulk_product_by_id(product_id):
    product = db.session.get(BulkProduct, product_id)

    if not product or not product.active:
        raise NotFoundError("Producto registrado no encontrado")

    return product


def _normalize_bulk_product_data(data):
    name = ((data.get("name") or "").strip()).upper()
    barcode = (data.get("barcode") or "").strip() or None
    package_quantity = data.get("package_quantity")
    unit = (data.get("unit") or "kg").strip()
    cost = data.get("cost")
    sale_margin = data.get("sale_margin", DEFAULT_SALE_MARGIN)

    if not name:
        raise ValidationError("El nombre del producto es obligatorio")

    if package_quantity is None or Decimal(str(package_quantity)) <= 0:
        raise ValidationError("La cantidad por producto debe ser mayor a 0")

    if sale_margin is None or sale_margin == "":
        sale_margin = DEFAULT_SALE_MARGIN

    sale_margin = float(sale_margin)

    if sale_margin < 0:
        raise ValidationError("El margen de venta no puede ser negativo")

    return {
        "name": name,
        "barcode": barcode,
        "package_quantity": Decimal(str(package_quantity)),
        "unit": unit,
        "cost": Decimal(str(cost)) if cost not in (None, "") else None,
        "sale_margin": sale_margin,
    }


def create_bulk_product(data):
    clean_data = _normalize_bulk_product_data(data)

    barcode = clean_data["barcode"]

    if barcode:
        existing = get_bulk_product_by_barcode(barcode)

        if existing:
            raise ConflictError("Ya existe un producto registrado con ese código")

    product = BulkProduct(**clean_data)

    db.session.add(product)
    db.session.commit()

    return product


def update_bulk_product(product_id, data):
    product = get_bulk_product_by_id(product_id)
    clean_data = _normalize_bulk_product_data(data)

    barcode = clean_data["barcode"]

    if barcode:
        existing = get_bulk_product_by_barcode(barcode)

        if existing and existing.id != product.id:
            raise ConflictError("Ya existe otro producto registrado con ese código")

    product.name = clean_data["name"]
    product.barcode = clean_data["barcode"]
    product.package_quantity = clean_data["package_quantity"]
    product.unit = clean_data["unit"]
    product.cost = clean_data["cost"]
    product.sale_margin = clean_data["sale_margin"]

    db.session.commit()

    return product


def register_bulk_restock(data):
    bulk_product_id = data.get("bulk_product_id")
    barcode = (data.get("barcode") or "").strip()
    quantity_packages = int(data.get("quantity_packages") or 1)
    note = data.get("note")

    if quantity_packages <= 0:
        raise ValidationError("La cantidad de productos debe ser mayor a 0")

    product = None

    if bulk_product_id:
        product = db.session.get(BulkProduct, bulk_product_id)

    elif barcode:
        product = get_bulk_product_by_barcode(barcode)

    if not product or not product.active:
        raise NotFoundError("Producto registrado no encontrado")

    total_cost = None

    if product.cost is not None:
        total_cost = product.cost * quantity_packages

    restock = BulkRestock(
        bulk_product_id=product.id,
        quantity_packages=quantity_packages,
        package_quantity=product.package_quantity,
        unit=product.unit,
        unit_cost=product.cost,
        total_cost=total_cost,
        note=note,
    )

    db.session.add(restock)
    db.session.commit()

    return restock


def get_bulk_restocks(limit=100):
    return (
        db.session.query(BulkRestock)
        .order_by(BulkRestock.created_at.desc())
        .limit(limit)
        .all()
    )