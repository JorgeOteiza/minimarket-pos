from backend.extensions import db


class BulkRestock(db.Model):
    __tablename__ = "bulk_restocks"

    id = db.Column(db.Integer, primary_key=True)

    bulk_product_id = db.Column(
        db.Integer,
        db.ForeignKey("bulk_products.id"),
        nullable=False,
        index=True,
    )

    quantity_packages = db.Column(db.Integer, nullable=False, default=1)

    package_quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=False)

    unit_cost = db.Column(db.Numeric(10, 2), nullable=True)
    total_cost = db.Column(db.Numeric(10, 2), nullable=True)

    note = db.Column(db.String(255), nullable=True)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
        index=True,
    )

    bulk_product = db.relationship(
        "BulkProduct",
        back_populates="restocks",
    )

    def to_dict(self):
        product = self.bulk_product

        return {
            "id": self.id,
            "bulk_product_id": self.bulk_product_id,
            "product_name": product.name if product else "Producto eliminado",
            "barcode": product.barcode if product else None,
            "quantity_packages": self.quantity_packages,
            "package_quantity": float(self.package_quantity),
            "unit": self.unit,
            "unit_cost": float(self.unit_cost) if self.unit_cost is not None else None,
            "total_cost": float(self.total_cost) if self.total_cost is not None else None,
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }