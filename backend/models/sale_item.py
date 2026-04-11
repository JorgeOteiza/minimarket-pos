from backend.extensions import db

class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id = db.Column(db.Integer, primary_key=True)

    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(db.Float, nullable=False)

    unit_price = db.Column(db.Numeric(10, 2), nullable=False)

    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    # 🔥 relaciones ORM limpias
    sale = db.relationship("Sale", back_populates="items")

    product = db.relationship("Product")