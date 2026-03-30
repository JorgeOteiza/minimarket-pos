from extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    barcode = db.Column(db.String(50), unique=True, nullable=True, index=True)

    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost = db.Column(db.Numeric(10, 2), nullable=True)

    stock = db.Column(db.Integer, default=0)

    # Para control de stock mínimo
    min_stock = db.Column(db.Integer, default=5)

    # Para productos a granel
    is_weighted = db.Column(db.Boolean, default=False)
    weight = db.Column(db.Float, nullable=True)  # ejemplo: 0.5, 1.0

    # Margen de ganancia
    margin = db.Column(db.Float, default=0.3)

    def __repr__(self):
        return f"<Product {self.name}>"