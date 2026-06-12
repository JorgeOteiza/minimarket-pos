from backend.extensions import db


class BusinessSettings(db.Model):
    __tablename__ = "business_settings"

    id = db.Column(db.Integer, primary_key=True)

    business_name = db.Column(db.String(150), nullable=False, default="MINIMARKET POS")
    rut = db.Column(db.String(30), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    footer_message = db.Column(db.String(255), nullable=True)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False,
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False,
    )

    def update_from_dict(self, data):
        for field in [
            "business_name",
            "rut",
            "address",
            "phone",
            "email",
            "footer_message",
        ]:
            if field in data:
                value = data[field]
                setattr(self, field, value.strip() if isinstance(value, str) else value)

    def to_dict(self):
        return {
            "id": self.id,
            "business_name": self.business_name,
            "rut": self.rut,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "footer_message": self.footer_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }