import { useEffect, useState } from "react";
import {
  getInventoryMovements,
  type InventoryMovement,
} from "../services/productApi";

type Props = {
  refreshKey?: number;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const getMovementLabel = (type: string) => {
  const labels: Record<string, string> = {
    SALE: "Venta",
    ADJUSTMENT_ADD: "Ajuste +",
    ADJUSTMENT_REMOVE: "Ajuste -",
    ADJUSTMENT_SET: "Ajuste fijo",
  };

  return labels[type] ?? type;
};

export default function InventoryMovementsList({ refreshKey = 0 }: Props) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    void getInventoryMovements(50)
      .then(setMovements)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error inesperado");
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return <p>Cargando historial de inventario...</p>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (movements.length === 0) {
    return <p>No hay movimientos de inventario registrados.</p>;
  }

  return (
    <section className="inventory-history-panel">
      <h2>Historial reciente de inventario</h2>

      <div className="inventory-history-table-wrapper">
        <table className="inventory-history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Antes</th>
              <th>Después</th>
              <th>Nota</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{formatDate(movement.created_at)}</td>
                <td>{movement.product_name}</td>
                <td>{getMovementLabel(movement.movement_type)}</td>
                <td>{movement.quantity}</td>
                <td>{movement.previous_stock}</td>
                <td>{movement.new_stock}</td>
                <td>{movement.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}