from extensions import db


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)

    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    items = db.relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan",
        lazy="joined"  # 🔥 importante para evitar N+1
    )