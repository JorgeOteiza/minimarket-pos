from marshmallow import Schema, fields, validate


class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
 
    name = fields.Str(required=True, validate=validate.Length(min=1))
    price = fields.Float(required=True)
    
    barcode = fields.Str(allow_none=True)
    cost = fields.Float(allow_none=True)

    stock = fields.Int(load_default=0)
    min_stock = fields.Int(load_default=5)

    is_weighted = fields.Bool(load_default=False)
    weight = fields.Float(allow_none=True)

    margin = fields.Float(load_default=0.3)