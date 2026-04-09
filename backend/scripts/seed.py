from backend.app import create_app
from backend.extensions import db

from backend.models.product import Product
from backend.models.category import Category
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def run_seed():
    app = create_app()

    with app.app_context():
        print("🌱 Seeding database...")

        # 🔴 LIMPIEZA CORRECTA (orden importa)
        db.session.query(SaleItem).delete()
        db.session.query(Sale).delete()
        db.session.query(Product).delete()
        db.session.query(Category).delete()

        # 🔹 categorías reales del negocio
        categorias = [
            Category(name="Mascotas"),
            Category(name="Bebidas"),
            Category(name="Snacks"),
            Category(name="Aseo Personal"),
            Category(name="Limpieza Hogar"),
            Category(name="Lácteos"),
            Category(name="Despensa"),
        ]

        db.session.add_all(categorias)
        db.session.flush()

        # 🔹 helper para mapear nombre → id
        cat_map = {c.name: c.id for c in categorias}

        # 🔹 productos realistas
        products = [
            # 🐶 Mascotas
            Product(
                name="Dog Chow 10kg",
                price=32000,
                cost=25000,
                stock=15,
                barcode="100001",
                category_id=cat_map["Mascotas"]
            ),
            Product(
                name="Whiskas 1kg",
                price=4500,
                cost=3000,
                stock=30,
                barcode="100002",
                category_id=cat_map["Mascotas"]
            ),

            # 🥤 Bebidas
            Product(
                name="Coca Cola 1.5L",
                price=1500,
                cost=1000,
                stock=40,
                barcode="200001",
                category_id=cat_map["Bebidas"]
            ),
            Product(
                name="Pepsi 2L",
                price=1800,
                cost=1200,
                stock=35,
                barcode="200002",
                category_id=cat_map["Bebidas"]
            ),

            # 🍫 Snacks
            Product(
                name="Super 8",
                price=300,
                cost=200,
                stock=100,
                barcode="300001",
                category_id=cat_map["Snacks"]
            ),
            Product(
                name="Papas Lays",
                price=1200,
                cost=800,
                stock=50,
                barcode="300002",
                category_id=cat_map["Snacks"]
            ),

            # 🧴 Aseo personal
            Product(
                name="Shampoo Head & Shoulders",
                price=4500,
                cost=3200,
                stock=20,
                barcode="400001",
                category_id=cat_map["Aseo Personal"]
            ),

            # 🧼 Limpieza hogar
            Product(
                name="Cloro 1L",
                price=1000,
                cost=700,
                stock=25,
                barcode="500001",
                category_id=cat_map["Limpieza Hogar"]
            ),

            # 🧀 Lácteos
            Product(
                name="Yogurt Colun",
                price=600,
                cost=400,
                stock=60,
                barcode="600001",
                category_id=cat_map["Lácteos"]
            ),

            # 🍞 Despensa
            Product(
                name="Pan de molde Ideal",
                price=2200,
                cost=1500,
                stock=30,
                barcode="700001",
                category_id=cat_map["Despensa"]
            ),
        ]

        db.session.add_all(products)
        db.session.commit()

        print("✅ Seed completado con productos realistas!")


if __name__ == "__main__":
    run_seed()