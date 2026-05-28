from backend.extensions import db

from backend.models.inventory_movement import (
    InventoryMovement,
)

from backend.exceptions import (
    InsufficientStockError,
)


def register_inventory_movement(
    *,
    product,
    quantity,
    movement_type,
    reference_id=None,
    note=None,
):
    previous_stock = product.stock

    new_stock = (
        previous_stock + quantity
    )

    # =========================
    # PROTEGER STOCK NEGATIVO
    # =========================

    if new_stock < 0:
        raise InsufficientStockError(
            f"Insufficient stock for {product.name}"
        )

    movement = InventoryMovement(
        product_id=product.id,

        movement_type=movement_type,

        quantity=quantity,

        previous_stock=previous_stock,

        new_stock=new_stock,

        reference_id=reference_id,

        note=note,
    )

    product.stock = new_stock

    db.session.add(movement)

    return movement

def get_inventory_movements(*, limit=50):
    movements = (
        db.session.query(InventoryMovement)
        .order_by(InventoryMovement.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": movement.id,
            "product_id": movement.product_id,
            "product_name": movement.product.name if movement.product else "Producto eliminado",
            "movement_type": movement.movement_type,
            "quantity": movement.quantity,
            "previous_stock": movement.previous_stock,
            "new_stock": movement.new_stock,
            "reference_id": movement.reference_id,
            "note": movement.note,
            "created_at": movement.created_at.isoformat(),
        }
        for movement in movements
    ]