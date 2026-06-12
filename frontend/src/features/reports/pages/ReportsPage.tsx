import { useEffect, useState } from "react";

import {
  getSalesReport,
  type ReportPeriod,
  type SalesReport,
} from "../services/reportsApi";

import "../styles/reports.css";

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "semester", label: "Semestre" },
  { key: "year", label: "Año" },
];

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatDateTime = (value: string | null) => {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<ReportPeriod>("today");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");
        setExpandedSaleId(null);

        const data = await getSalesReport(activePeriod);

        if (!isMounted) return;

        setReport(data);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [activePeriod]);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reportes de ventas</h1>
          <p>Revisa ventas diarias, semanales, mensuales y anuales.</p>
        </div>
      </div>

      <div className="reports-tabs">
        {PERIODS.map((period) => (
          <button
            key={period.key}
            type="button"
            className={activePeriod === period.key ? "active" : ""}
            onClick={() => setActivePeriod(period.key)}
          >
            {period.label}
          </button>
        ))}
      </div>

      {error && <div className="reports-error">{error}</div>}

      {loading ? (
        <p className="reports-loading">Cargando reporte...</p>
      ) : !report ? (
        <p className="reports-loading">No hay datos disponibles.</p>
      ) : (
        <>
          <section className="reports-period-card">
            <div>
              <span>Periodo seleccionado</span>
              <strong>{report.period.label}</strong>
              <small>
                {report.period.start_date} al {report.period.end_date}
              </small>
            </div>
          </section>

          <section className="reports-kpi-grid">
            <div className="reports-kpi-card">
              <span>Total vendido</span>
              <strong>{formatCLP(report.summary.total_sales)}</strong>
              <small>Monto acumulado del periodo</small>
            </div>

            <div className="reports-kpi-card">
              <span>Cantidad de ventas</span>
              <strong>{report.summary.sales_count}</strong>
              <small>Ventas registradas</small>
            </div>

            <div className="reports-kpi-card">
              <span>Ticket promedio</span>
              <strong>{formatCLP(report.summary.average_ticket)}</strong>
              <small>Promedio por venta</small>
            </div>

            <div className="reports-kpi-card">
              <span>Unidades vendidas</span>
              <strong>{report.summary.total_units_sold}</strong>
              <small>Productos vendidos</small>
            </div>
          </section>

          <section className="reports-grid">
            <div className="reports-card">
              <h2>Productos más vendidos</h2>

              {report.top_products.length === 0 ? (
                <p>No hay productos vendidos en este periodo.</p>
              ) : (
                <div className="reports-list">
                  {report.top_products.map((product, index) => (
                    <div key={product.id} className="reports-row">
                      <div>
                        <strong>
                          #{index + 1} · {product.name}
                        </strong>
                        <span>{product.quantity_sold} unidades</span>
                      </div>

                      <b>{formatCLP(product.total_sold)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="reports-card">
              <h2>Ventas recientes</h2>

              {report.recent_sales.length === 0 ? (
                <p>No hay ventas registradas en este periodo.</p>
              ) : (
                <div className="reports-sales-list">
                  {report.recent_sales.map((sale) => {
                    const isExpanded = expandedSaleId === sale.id;

                    return (
                      <div key={sale.id} className="reports-sale-item">
                        <button
                          type="button"
                          className="reports-sale-summary"
                          onClick={() =>
                            setExpandedSaleId(isExpanded ? null : sale.id)
                          }
                        >
                          <div>
                            <strong>Venta #{sale.id}</strong>
                            <span>{formatDateTime(sale.created_at)}</span>
                          </div>

                          <div className="reports-sale-total">
                            <b>{formatCLP(sale.total_amount)}</b>
                            <small>{sale.items_count} productos</small>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="reports-sale-detail">
                            {sale.items.map((item) => (
                              <div
                                key={`${sale.id}-${item.product_id}-${item.product_name}`}
                                className="reports-sale-detail-row"
                              >
                                <div>
                                  <strong>{item.product_name}</strong>
                                  <span>
                                    {item.quantity} ×{" "}
                                    {formatCLP(item.unit_price)}
                                  </span>
                                </div>

                                <b>{formatCLP(item.subtotal)}</b>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
