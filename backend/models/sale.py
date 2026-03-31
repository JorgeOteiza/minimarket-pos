from extensions import db


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)

    quantity = db.Column(db.Float, nullable=False)

    total_price = db.Column(db.Numeric(10, 2), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())