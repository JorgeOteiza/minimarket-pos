from flask import Blueprint, jsonify, request

from backend.exceptions import (
    ValidationError,
    NotFoundError,
    InsufficientStockError,
)

from backend.services.inventory_adjustment_service import adjust_inventory
from backend.services.inventory_service import get_inventory_movements

inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.route("/inventory/adjust", methods=["POST"])
def adjust_inventory_route():
    data = request.get_json() or {}

    try:
        product = adjust_inventory(
            product_id=data.get("product_id"),
            quantity=data.get("quantity"),
            movement_type=data.get("movement_type"),
            note=data.get("note"),
        )

        return jsonify({
            "message": "Inventory adjusted successfully",
            "product_id": product.id,
            "new_stock": product.stock,
        }), 200

    except (ValidationError, NotFoundError, InsufficientStockError) as err:
        return jsonify({"error": str(err)}), 400

    except Exception as err:
        return jsonify({"error": str(err)}), 500


@inventory_bp.route("/inventory/movements", methods=["GET"])
def inventory_movements_route():
    try:
        limit = request.args.get("limit", 50, type=int)

        movements = get_inventory_movements(limit=limit)

        return jsonify(movements), 200

    except Exception as err:
        return jsonify({"error": str(err)}), 500