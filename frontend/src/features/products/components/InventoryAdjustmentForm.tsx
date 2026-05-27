import { useMemo, useState } from "react";
import type { Product } from "../types/product";

import { adjustInventory } from "../services/productApi";

type Props = {
  product: Product;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
};

type MovementType = "ADJUSTMENT_ADD" | "ADJUSTMENT_REMOVE" | "ADJUSTMENT_SET";

const movementLabels: Record<MovementType, string> = {
  ADJUSTMENT_ADD: "Agregar stock",
  ADJUSTMENT_REMOVE: "Quitar stock",
  ADJUSTMENT_SET: "Ajustar stock final",
};

export default function InventoryAdjustmentForm({
  product,
  onClose,
  onSuccess,
}: Props) {
  const [movementType, setMovementType] =
    useState<MovementType>("ADJUSTMENT_ADD");

  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const parsedQuantity = Number(quantity);

  const projectedStock = useMemo(() => {
    if (!quantity || Number.isNaN(parsedQuantity)) {
      return product.stock;
    }

    if (movementType === "ADJUSTMENT_ADD") {
      return product.stock + parsedQuantity;
    }

    if (movementType === "ADJUSTMENT_REMOVE") {
      return product.stock - parsedQuantity;
    }

    return parsedQuantity;
  }, [movementType, parsedQuantity, product.stock, quantity]);

  const movementDelta = projectedStock - product.stock;

  const isInvalidQuantity =
    !quantity || Number.isNaN(parsedQuantity) || parsedQuantity <= 0;

  const willBeNegative = projectedStock < 0;

  const canSubmit =
    !loading && !isInvalidQuantity && !willBeNegative && note.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (isInvalidQuantity) {
      setError("Debes ingresar una cantidad válida.");
      return;
    }

    if (willBeNegative) {
      setError("El ajuste dejaría el stock en negativo.");
      return;
    }

    if (!note.trim()) {
      setError("Debes ingresar una nota para auditar el movimiento.");
      return;
    }

    try {
      setLoading(true);

      await adjustInventory({
        product_id: product.id,
        quantity: parsedQuantity,
        movement_type: movementType,
        note: note.trim(),
      });

      setSuccess("Inventario actualizado correctamente.");
      setQuantity("");
      setNote("");

      await onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <div className="product-form-header">
        <div>
          <h2>Ajustar inventario</h2>
          <p>{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form-body">
        <div className="inventory-summary-card">
          <span>Stock actual</span>
          <strong>{product.stock}</strong>
        </div>

        <div className="form-grid">
          <div className="form-field full">
            <label>Tipo de ajuste</label>

            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as MovementType)}
            >
              <option value="ADJUSTMENT_ADD">Agregar stock</option>
              <option value="ADJUSTMENT_REMOVE">Quitar stock</option>
              <option value="ADJUSTMENT_SET">Ajustar stock final</option>
            </select>
          </div>

          <div className="form-field full">
            <label>Cantidad</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={willBeNegative ? "input-error" : ""}
              placeholder="Ej: 10"
            />

            {willBeNegative && (
              <span className="field-error">
                El stock proyectado no puede ser negativo.
              </span>
            )}
          </div>

          <div className="form-field full">
            <label>Nota obligatoria</label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: ingreso de mercadería, merma, corrección por conteo físico..."
            />
          </div>
        </div>

        <div
          className={`inventory-preview ${
            willBeNegative ? "danger" : "neutral"
          }`}
        >
          <span>{movementLabels[movementType]}</span>

          <strong>
            {product.stock} {movementDelta >= 0 ? "+" : ""}
            {movementDelta} → {projectedStock}
          </strong>
        </div>

        {success && <div className="form-success-message">✓ {success}</div>}

        {error && <div className="form-error-message">✕ {error}</div>}

        <div className="product-form-actions">
          <button type="submit" disabled={!canSubmit} className="primary-btn">
            {loading ? "Guardando..." : "Guardar ajuste"}
          </button>

          <button type="button" className="secondary-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
}
