from backend.extensions import db

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)

    barcode = db.Column(db.String(50), unique=True, nullable=True, index=True)

    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost = db.Column(db.Numeric(10, 2), nullable=True)

    stock = db.Column(db.Integer, default=0)
    min_stock = db.Column(db.Integer, default=5)

    is_weighted = db.Column(db.Boolean, default=False)
    weight = db.Column(db.Float, nullable=True)

    margin = db.Column(db.Float, default=0.3)

    # 🔥 FK REAL (esto es lo que te falta en la BD)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id"),
        nullable=True
    )

    # 🔥 relación ORM
    category = db.relationship(
        "Category",
        back_populates="products"
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "barcode": self.barcode,
            "price": float(self.price),
            "cost": float(self.cost) if self.cost else None,
            "stock": self.stock,
            "min_stock": self.min_stock,
            "is_weighted": self.is_weighted,
            "weight": self.weight,
            "margin": self.margin,
            "category_id": self.category_id,
        }