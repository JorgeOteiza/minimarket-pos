from marshmallow import Schema, fields, validate, EXCLUDE


class ProductSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Int(dump_only=True)

    name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=150),
    )

    price = fields.Float(
        required=False,
        allow_none=True,
        validate=validate.Range(min=0),
    )

    barcode = fields.Str(
        required=False,
        allow_none=True,
        validate=validate.Length(max=50),
    )

    cost = fields.Float(
        required=False,
        allow_none=True,
        validate=validate.Range(min=0),
    )

    stock = fields.Int(
        required=False,
        load_default=0,
        validate=validate.Range(min=0),
    )

    min_stock = fields.Int(
        required=False,
        load_default=5,
        validate=validate.Range(min=0),
    )

    is_weighted = fields.Bool(required=False, load_default=False)

    weight = fields.Float(
        required=False,
        allow_none=True,
        validate=validate.Range(min=0),
    )

    margin = fields.Float(
        required=False,
        load_default=0.3,
        validate=validate.Range(min=0),
    )

    category_id = fields.Int(
        required=False,
        allow_none=True,
        validate=validate.Range(min=1),
    )