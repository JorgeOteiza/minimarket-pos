from backend.app import create_app
from backend.extensions import db

from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.models.cart_item import CartItem


def clean_demo_data():
    app = create_app()

    with app.app_context():
        print("========================================")
        print(" LIMPIEZA DE DATOS DE PRUEBA")
        print("========================================")

        db.session.query(CartItem).delete()
        db.session.query(SaleItem).delete()
        db.session.query(Sale).delete()
        
        db.session.commit()

        print("LIMPIEZA COMPLETADA")
        print(
            "Se eliminaron las ventas y el carrito. "
            "Se mantuvieron productos, stock, historial de inventario, "
            "reposiciones y configuración."
        )


if __name__ == "__main__":
    clean_demo_data()