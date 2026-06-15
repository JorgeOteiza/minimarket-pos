from backend.extensions import db
from backend.models import Product
from backend.exceptions import NotFoundError, ValidationError
from backend.services.inventory_service import register_inventory_movement


VALID_MOVEMENT_TYPES = {
    "ADJUSTMENT_ADD",
    "ADJUSTMENT_REMOVE",
    "ADJUSTMENT_SET",
}


def adjust_inventory(
    *,
    product_id,
    quantity,
    movement_type,
    note=None,
):
    if movement_type not in VALID_MOVEMENT_TYPES:
        raise ValidationError("Tipo de movimiento de inventario inválido.")

    quantity = int(quantity)

    if quantity <= 0:
        raise ValidationError("La cantidad debe ser mayor a 0.")

    with db.session.begin():
        product = (
            db.session.query(Product)
            .filter(Product.id == product_id)
            .with_for_update()
            .first()
        )

        if not product:
            raise NotFoundError("No se encontró el producto solicitado.")

        if movement_type == "ADJUSTMENT_ADD":
            register_inventory_movement(
                product=product,
                quantity=quantity,
                movement_type=movement_type,
                note=note,
            )

        elif movement_type == "ADJUSTMENT_REMOVE":
            if product.stock < quantity:
                raise ValidationError(
                    f"Stock insuficiente para {product.name}. "
                    f"Disponible: {product.stock} unidades."
                )

            register_inventory_movement(
                product=product,
                quantity=-quantity,
                movement_type=movement_type,
                note=note,
            )

        elif movement_type == "ADJUSTMENT_SET":
            difference = quantity - product.stock

            register_inventory_movement(
                product=product,
                quantity=difference,
                movement_type=movement_type,
                note=note,
            )

    return product