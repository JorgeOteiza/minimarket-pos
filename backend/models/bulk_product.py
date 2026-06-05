from backend.extensions import db


class BulkProduct(db.Model):
    __tablename__ = "bulk_products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    barcode = db.Column(db.String(50), unique=True, nullable=True, index=True)

    package_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False, default="kg")

    cost = db.Column(db.Numeric(10, 2), nullable=True)

    active = db.Column(db.Boolean, default=True, nullable=False)
    
    sale_margin = db.Column(db.Float, nullable=False, default=0.4)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    restocks = db.relationship(
        "BulkRestock",
        back_populates="bulk_product",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "barcode": self.barcode,
            "package_quantity": float(self.package_quantity),
            "unit": self.unit,
            "cost": float(self.cost) if self.cost is not None else None,
            "active": self.active,
            "sale_margin": self.sale_margin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }