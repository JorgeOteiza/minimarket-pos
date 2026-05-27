from flask import (
    Blueprint,
    jsonify,
    request,
)

from marshmallow import (
    ValidationError,
)

from backend.services.inventory_adjustment_service import (
    adjust_inventory,
)

from backend.exceptions import ValidationError, NotFoundError, InsufficientStockError

inventory_bp = Blueprint(
    "inventory",
    __name__,
)


@inventory_bp.route(
    "/inventory/adjust",
    methods=["POST"],
)
def adjust_inventory_route():

    data = request.get_json()

    try:

        product_id = data.get(
            "product_id"
        )

        quantity = data.get(
            "quantity"
        )

        movement_type = data.get(
            "movement_type"
        )

        note = data.get(
            "note"
        )

        product = adjust_inventory(
            product_id=product_id,
            quantity=quantity,
            movement_type=movement_type,
            note=note,
        )

        return jsonify({
            "message":
                "Inventory adjusted successfully",

            "product_id":
                product.id,

            "new_stock":
                product.stock,
        }), 200

    except ValidationError as err:

        return jsonify({
            "error":
                str(err),
        }), 400

    except Exception as err:

        return jsonify({
            "error":
                str(err),
        }), 500
        
        
    except (ValidationError, NotFoundError, InsufficientStockError) as err:
        return jsonify({"error": str(err)}), 400