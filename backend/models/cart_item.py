from backend.extensions import db


class CartItem(db.Model):
    __tablename__ = "cart_items"

    __table_args__ = (
        db.UniqueConstraint(
            "cart_id",
            "product_id",
            name="uq_cart_items_cart_id_product_id",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)

    cart_id = db.Column(
        db.Integer,
        db.ForeignKey("carts.id"),
        nullable=False,
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False,
    )

    quantity = db.Column(db.Float, nullable=False)