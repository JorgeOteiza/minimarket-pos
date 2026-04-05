from models import Product
from models.sale import Sale
from models.sale_item import SaleItem
from extensions import db
from exceptions import InsufficientStockError, ValidationError, NotFoundError
from sqlalchemy.orm import joinedload


def get_all_sales():
    return db.session.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product)
    ).all()


def get_sale_by_id(id):
    return db.session.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product)
    ).filter(Sale.id == id).first()


def create_sale(data):
    items_data = data["items"]

    if not items_data:
        raise ValidationError("Sale must have at least one item")

    sale = Sale(total_amount=0)
    total_amount = 0

    for item in items_data:
        product = db.session.get(Product, item["product_id"])

        if not product:
            raise NotFoundError(f"Product {item['product_id']} not found")

        if product.stock < item["quantity"]:
            raise InsufficientStockError(
                f"Not enough stock for {product.name}"
)

        subtotal = float(product.price) * item["quantity"]

        sale_item = SaleItem(
            product_id=product.id,
            quantity=item["quantity"],
            unit_price=product.price,
            subtotal=subtotal
        )

        # 🔻 actualizar stock
        product.stock -= item["quantity"]

        sale.items.append(sale_item)

        total_amount += subtotal

    sale.total_amount = total_amount

    db.session.add(sale)
    db.session.commit()
    print("SERVICE EXECUTED")

    return sale