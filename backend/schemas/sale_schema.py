from marshmallow import Schema, fields


class SaleSchema(Schema):
    id = fields.Int(dump_only=True)

    product_id = fields.Int(required=True)
    quantity = fields.Float(required=True)

    total_price = fields.Float(dump_only=True)
    created_at = fields.DateTime(dump_only=True)