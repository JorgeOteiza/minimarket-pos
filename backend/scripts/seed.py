from app import create_app
from extensions import db
from models.product import Product
from models.category import Category


def run_seed():
    app = create_app()

    with app.app_context():
        print("🌱 Seeding database...")

        # 🔹 limpiar (opcional en dev)
        db.session.query(Product).delete()
        db.session.query(Category).delete()

        # 🔹 categorías
        cat1 = Category(name="Bebidas")
        cat2 = Category(name="Mascotas")

        db.session.add_all([cat1, cat2])
        db.session.flush()  # para obtener IDs

        # 🔹 productos
        products = [
            Product(
                name="Coca Cola 1.5L",
                price=1500,
                cost=1000,
                stock=20,
                barcode="123456",
                category_id=cat1.id
            ),
            Product(
                name="Whiskas 10kg",
                price=25000,
                cost=18000,
                stock=10,
                barcode="789456",
                category_id=cat2.id
            )
        ]

        db.session.add_all(products)
        db.session.commit()

        print("✅ Seed completed!")


if __name__ == "__main__":
    run_seed()