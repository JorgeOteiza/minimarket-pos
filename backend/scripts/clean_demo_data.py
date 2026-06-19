from backend.app import create_app
from backend.extensions import db

from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.models.cart_item import CartItem
from backend.models.inventory_movement import InventoryMovement
from backend.models.bulk_restock import BulkRestock


def clean_demo_data():
    app = create_app()

    with app.app_context():
        print("========================================")
        print(" LIMPIEZA DE DATOS DE PRUEBA")
        print("========================================")

        db.session.query(CartItem).delete()
        db.session.query(SaleItem).delete()
        db.session.query(Sale).delete()
        db.session.query(InventoryMovement).delete()
        db.session.query(BulkRestock).delete()

        db.session.commit()

        print("LIMPIEZA COMPLETADA")
        print("Se mantuvieron productos, productos bulk y configuración del negocio.")


if __name__ == "__main__":
    clean_demo_data()