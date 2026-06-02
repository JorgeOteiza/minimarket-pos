import { useEffect, useMemo, useState } from "react";

import {
  getInventoryMovements,
  type InventoryMovement,
} from "../services/productApi";

type Props = {
  refreshKey?: number;
};

type MovementFilter = "ALL" | "SALE" | "ADJUSTMENT";
type DateSort = "newest" | "oldest";

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

const isAdjustment = (type: string) => type.startsWith("ADJUSTMENT");

export default function InventoryMovementsList({ refreshKey = 0 }: Props) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("ALL");
  const [dateSort, setDateSort] = useState<DateSort>("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMovements = async () => {
      try {
        const data = await getInventoryMovements(100);

        if (!isMounted) return;

        setMovements(data);
        setError("");
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMovements();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...movements]
      .filter((movement) => {
        const productName = movement.product_name.toLowerCase();

        const matchesSearch =
          !normalizedSearch || productName.includes(normalizedSearch);

        const matchesType =
          movementFilter === "ALL" ||
          movement.movement_type === movementFilter ||
          (movementFilter === "ADJUSTMENT" &&
            isAdjustment(movement.movement_type));

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        return dateSort === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [movements, search, movementFilter, dateSort]);

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
      <div className="inventory-history-header">
        <div>
          <h2>Historial reciente de inventario</h2>
          <p>Revisa ventas y ajustes registrados en stock.</p>
        </div>

        <span>{filteredMovements.length} movimientos</span>
      </div>

      <div className="inventory-history-filters">
        <input
          type="text"
          placeholder="Buscar producto en historial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={movementFilter}
          onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
        >
          <option value="ALL">Todos</option>
          <option value="SALE">Ventas</option>
          <option value="ADJUSTMENT">Ajustes</option>
        </select>

        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value as DateSort)}
        >
          <option value="newest">Más reciente</option>
          <option value="oldest">Más antiguo</option>
        </select>
      </div>

      {filteredMovements.length === 0 ? (
        <p>No hay movimientos que coincidan con los filtros.</p>
      ) : (
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
              {filteredMovements.map((movement) => (
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
      )}
    </section>
  );
}
