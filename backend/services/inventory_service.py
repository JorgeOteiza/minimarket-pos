from backend.extensions import db
from backend.models.inventory_movement import InventoryMovement


def register_inventory_movement(
    *,
    product,
    quantity,
    movement_type,
    reference_id=None,
    note=None,
):
    previous_stock = product.stock
    new_stock = previous_stock + quantity

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