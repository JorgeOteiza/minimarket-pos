type Props = {
  lowStockCount: number;
  productsWithoutPriceCount: number;
};

export default function InventoryStatusChart({
  lowStockCount,
  productsWithoutPriceCount,
}: Props) {
  const totalAlerts = lowStockCount + productsWithoutPriceCount;

  const statusLabel =
    totalAlerts === 0 ? "Inventario en buen estado" : "Requiere revisión";

  const statusClass = totalAlerts === 0 ? "ok" : "warning";

  return (
    <div className="analytics-chart-card inventory-alert-card">
      <div className="analytics-chart-header">
        <h2>Alertas de inventario</h2>
        <p>Productos que requieren revisión administrativa.</p>
      </div>

      <div className={`inventory-alert-status ${statusClass}`}>
        <span>Estado general</span>
        <strong>{statusLabel}</strong>
      </div>

      <div className="inventory-alert-grid">
        <div className="inventory-alert-box">
          <span>Bajo stock</span>
          <strong>{lowStockCount}</strong>
          <small>Productos que requieren reposición</small>
        </div>

        <div className="inventory-alert-box">
          <span>Sin precio</span>
          <strong>{productsWithoutPriceCount}</strong>
          <small>No pueden venderse en el POS</small>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <div className="inventory-alert-message ok">
          No hay alertas activas por ahora.
        </div>
      ) : (
        <div className="inventory-alert-message warning">
          Revisa estos productos en la sección de Productos.
        </div>
      )}
    </div>
  );
}
