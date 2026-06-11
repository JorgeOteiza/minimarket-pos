
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.config import Config
from backend.models.category import Category
from backend.models.product import Product
from backend.extensions import db
from backend.app import create_app


POSTGRES_URL = "postgresql://postgres:postgresDev9@localhost/minimarket"


def migrate_categories(postgres_session):
    rows = postgres_session.execute(
        text("SELECT id, name FROM categories ORDER BY id")
    ).mappings().all()

    inserted = 0

    for row in rows:
        existing = db.session.get(Category, row["id"])

        if existing:
            continue

        category = Category(
            id=row["id"],
            name=row["name"],
        )

        db.session.add(category)
        inserted += 1

    return inserted


def migrate_products(postgres_session):
    rows = postgres_session.execute(
        text("""
            SELECT
                id,
                name,
                barcode,
                pack_units,
                price,
                cost,
                stock,
                min_stock,
                is_weighted,
                weight,
                margin,
                category_id
            FROM products
            ORDER BY id
        """)
    ).mappings().all()

    inserted = 0
    skipped = 0

    for row in rows:
        existing = db.session.get(Product, row["id"])

        if existing:
            skipped += 1
            continue

        product = Product(
            id=row["id"],
            name=row["name"],
            barcode=row["barcode"],
            pack_units=row["pack_units"],
            price=row["price"],
            cost=row["cost"],
            stock=row["stock"] or 0,
            min_stock=row["min_stock"] or 5,
            is_weighted=row["is_weighted"] or False,
            weight=row["weight"],
            margin=row["margin"] or 0.3,
            category_id=row["category_id"],
        )

        db.session.add(product)
        inserted += 1

    return inserted, skipped


def main():
    app = create_app()

    print("===================================")
    print("MIGRACIÓN POSTGRESQL → SQLITE")
    print("===================================")
    print(f"Destino actual: {Config.SQLALCHEMY_DATABASE_URI}")

    if not Config.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
        raise RuntimeError(
            "El destino actual no es SQLite. "
            "Comenta DATABASE_URL en .env o usa SQLite antes de ejecutar."
        )

    postgres_engine = create_engine(POSTGRES_URL)
    PostgresSession = sessionmaker(bind=postgres_engine)
    postgres_session = PostgresSession()

    try:
        with app.app_context():
            categories_inserted = migrate_categories(postgres_session)
            products_inserted, products_skipped = migrate_products(postgres_session)

            db.session.commit()

            print("-----------------------------------")
            print(f"Categorías migradas: {categories_inserted}")
            print(f"Productos migrados: {products_inserted}")
            print(f"Productos omitidos: {products_skipped}")
            print("-----------------------------------")
            print("Migración completada correctamente.")

    except Exception as err:
        db.session.rollback()
        print("ERROR durante la migración:")
        print(err)
        raise

    finally:
        postgres_session.close()


if __name__ == "__main__":
    main()