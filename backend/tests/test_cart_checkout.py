from backend.extensions import db
from backend.models import InventoryMovement, Product, Sale
from backend.models.cart_item import CartItem


def create_product(**overrides):
    data = {
        "name": "PAN",
        "barcode": "780000000001",
        "price": 1000,
        "stock": 3,
    }
    data.update(overrides)

    product = Product(**data)
    db.session.add(product)
    db.session.commit()

    return product


def test_checkout_discounts_stock_and_clears_cart(client, app):
    with app.app_context():
        product = create_product()
        product_id = product.id

    scan_response = client.post("/api/cart/scan/780000000001")

    assert scan_response.status_code == 200
    assert scan_response.get_json()["total"] == 1000.0

    checkout_response = client.post("/api/cart/checkout")

    assert checkout_response.status_code == 201
    assert checkout_response.get_json()["total"] == 1000.0

    with app.app_context():
        product = db.session.get(Product, product_id)
        sale = db.session.query(Sale).one()
        movement = db.session.query(InventoryMovement).one()

        assert product.stock == 2
        assert len(sale.items) == 1
        assert float(sale.total_amount) == 1000.0
        assert movement.movement_type == "SALE"
        assert movement.previous_stock == 3
        assert movement.new_stock == 2
        assert db.session.query(CartItem).count() == 0


def test_checkout_rejects_product_without_price(client, app):
    with app.app_context():
        create_product(price=None)

    scan_response = client.post("/api/cart/scan/780000000001")
    checkout_response = client.post("/api/cart/checkout")

    assert scan_response.status_code == 200
    assert checkout_response.status_code == 422
    assert "no tiene precio registrado" in checkout_response.get_json()["error"]


def test_scan_rejects_when_stock_is_insufficient(client, app):
    with app.app_context():
        create_product(stock=0)

    response = client.post("/api/cart/scan/780000000001")

    assert response.status_code == 422
    assert "Stock insuficiente" in response.get_json()["error"]


def test_checkout_rejects_empty_cart(client):
    response = client.post("/api/cart/checkout")

    assert response.status_code == 422
    assert response.get_json()["error"] == "El carrito está vacío."
