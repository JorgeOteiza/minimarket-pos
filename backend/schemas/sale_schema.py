from marshmallow import Schema, fields


# 🔹 INPUT (lo que envía el cliente)
class SaleItemInputSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Float(required=True)


class SaleInputSchema(Schema):
    items = fields.List(
        fields.Nested(SaleItemInputSchema),
        required=True
    )


# 🔹 OUTPUT (lo que responde la API)
class SaleItemOutputSchema(Schema):
    product_id = fields.Int()
    quantity = fields.Float()
    unit_price = fields.Float()
    subtotal = fields.Float()


class SaleOutputSchema(Schema):
    id = fields.Int()
    items = fields.List(fields.Nested(SaleItemOutputSchema))
    total_amount = fields.Float()
    created_at = fields.DateTime()