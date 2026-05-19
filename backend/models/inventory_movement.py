from backend.extensions import db


class InventoryMovement(db.Model):
    __tablename__ = "inventory_movements"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    movement_type = db.Column(
        db.String(30),
        nullable=False,
        index=True
    )

    quantity = db.Column(
    db.Float,
    nullable=False
)

    previous_stock = db.Column(
        db.Integer,
        nullable=False
    )

    new_stock = db.Column(
        db.Integer,
        nullable=False
    )

    reference_id = db.Column(
        db.Integer,
        nullable=True
    )

    note = db.Column(
        db.String(255),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True
    )

    product = db.relationship("Product")

    def __repr__(self):
        return (
            f"<InventoryMovement "
            f"product_id={self.product_id} "
            f"type={self.movement_type} "
            f"qty={self.quantity}>"
        )