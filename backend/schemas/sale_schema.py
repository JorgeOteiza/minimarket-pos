from marshmallow import Schema, fields, ValidationError
from marshmallow.decorators import validates

from backend.schemas.product_schema import ProductSchema


class SaleItemInputSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Float(required=True)

    @validates("quantity")
    def validate_quantity(self, value, **kwargs):
        if value <= 0:
            raise ValidationError("La cantidad debe ser mayor a 0.")


class SaleInputSchema(Schema):
    items = fields.List(
        fields.Nested(SaleItemInputSchema),
        required=True,
    )

    @validates("items")
    def validate_items(self, value, **kwargs):
        if not value:
            raise ValidationError("La venta debe tener al menos un producto.")


class SaleItemOutputSchema(Schema):
    product_id = fields.Int()
    quantity = fields.Float()
    unit_price = fields.Decimal(as_string=True)
    subtotal = fields.Decimal(as_string=True)
    product = fields.Nested(ProductSchema)


class SaleOutputSchema(Schema):
    id = fields.Int()
    items = fields.List(fields.Nested(SaleItemOutputSchema))
    total_amount = fields.Decimal(as_string=True)
    created_at = fields.DateTime()