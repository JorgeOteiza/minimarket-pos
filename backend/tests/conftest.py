import os
import sys

import pytest

TEST_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if TEST_ROOT not in sys.path:
    sys.path.insert(0, TEST_ROOT)

from backend.app import create_app
from backend.extensions import db as _db
from backend.models import InventoryMovement, Product, Sale, SaleItem
from backend.models.cart import Cart
from backend.models.cart_item import CartItem


@pytest.fixture(scope="session")
def app():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_ENGINE_OPTIONS": {
                "connect_args": {
                    "check_same_thread": False,
                },
            },
            "CORS_ORIGINS": ["http://localhost:5173"],
            "ENABLE_AUTO_BACKUP": False,
        }
    )

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture(autouse=True)
def clean_database(app):
    yield

    with app.app_context():
        for model in (
            CartItem,
            Cart,
            SaleItem,
            Sale,
            InventoryMovement,
            Product,
        ):
            _db.session.query(model).delete()

        _db.session.commit()
