from backend.app import create_app
from backend.extensions import db
from backend.models.product import Product
from backend.models.category import Category
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def clear_demo_data():
    app = create_app()

    with app.app_context():
        print("🧹 Cleaning demo data...")

        db.session.query(SaleItem).delete()
        db.session.query(Sale).delete()
        db.session.query(Product).delete()
        db.session.query(Category).delete()

        db.session.commit()

        print("✅ Demo data cleaned")


if __name__ == "__main__":
    clear_demo_data()