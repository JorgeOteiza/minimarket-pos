import { useEffect, useState } from "react";
import SalesChart from "../components/charts/SalesChart";
import "../../styles/analytics.css";

import {
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "../services/analyticsApi";

type AnalyticsTab = "summary" | "sales" | "inventory" | "products";

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("summary");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getAnalyticsSummary()
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Error inesperado");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando analytics...</p>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return <p>No hay datos disponibles.</p>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analítica de Datos</h1>
          <p>Resumen comercial e inventario del minimarket.</p>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          type="button"
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          Resumen
        </button>

        <button
          type="button"
          className={activeTab === "sales" ? "active" : ""}
          onClick={() => setActiveTab("sales")}
        >
          Ventas
        </button>

        <button
          type="button"
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          Inventario
        </button>

        <button
          type="button"
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>
      </div>

      {activeTab === "summary" && (
        <>
          <div className="analytics-kpi-grid">
            <div className="analytics-card">
              <span>Ventas hoy</span>
              <strong>{data.today.sales_count}</strong>
              <small>{formatCLP(data.today.total_sales)}</small>
            </div>

            <div className="analytics-card">
              <span>Ventas últimos 30 días</span>
              <strong>{data.last_30_days.sales_count}</strong>
              <small>{formatCLP(data.last_30_days.total_sales)}</small>
            </div>

            <div className="analytics-card">
              <span>Productos con bajo stock</span>
              <strong>{data.low_stock_products.length}</strong>
              <small>Revisar reposición</small>
            </div>

            <div className="analytics-card">
              <span>Productos sin precio</span>
              <strong>{data.products_without_price.length}</strong>
              <small>No se pueden vender</small>
            </div>
          </div>

          <SalesChart data={data.sales_by_day} />

          <div className="analytics-grid">
            <section className="analytics-panel">
              <h2>Productos más vendidos</h2>

              {data.top_products.length === 0 ? (
                <p>No hay ventas registradas.</p>
              ) : (
                data.top_products.map((product) => (
                  <div key={product.id} className="analytics-row">
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.quantity_sold} unidades</span>
                    </div>

                    <b>{formatCLP(product.total_sold)}</b>
                  </div>
                ))
              )}
            </section>

            <section className="analytics-panel">
              <h2>Stock bajo</h2>

              {data.low_stock_products.length === 0 ? (
                <p>No hay productos críticos.</p>
              ) : (
                data.low_stock_products.slice(0, 6).map((product) => (
                  <div key={product.id} className="analytics-row">
                    <div>
                      <strong>{product.name}</strong>
                      <span>Mínimo: {product.min_stock}</span>
                    </div>

                    <b>{product.stock}</b>
                  </div>
                ))
              )}
            </section>

            <section className="analytics-panel">
              <h2>Productos sin precio</h2>

              {data.products_without_price.length === 0 ? (
                <p>Todos los productos tienen precio.</p>
              ) : (
                data.products_without_price.slice(0, 6).map((product) => (
                  <div key={product.id} className="analytics-row">
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.barcode || "Sin código"}</span>
                    </div>

                    <b>Sin precio</b>
                  </div>
                ))
              )}
            </section>
          </div>
        </>
      )}

      {activeTab === "sales" && (
        <div className="analytics-grid analytics-grid-two">
          <section className="analytics-panel">
            <h2>Ventas</h2>

            <div className="analytics-row">
              <div>
                <strong>Ventas de hoy</strong>
                <span>Cantidad de ventas registradas</span>
              </div>

              <b>{data.today.sales_count}</b>
            </div>

            <div className="analytics-row">
              <div>
                <strong>Total vendido hoy</strong>
                <span>Monto acumulado del día</span>
              </div>

              <b>{formatCLP(data.today.total_sales)}</b>
            </div>

            <div className="analytics-row">
              <div>
                <strong>Ventas últimos 30 días</strong>
                <span>Cantidad de ventas recientes</span>
              </div>

              <b>{data.last_30_days.sales_count}</b>
            </div>

            <div className="analytics-row">
              <div>
                <strong>Total últimos 30 días</strong>
                <span>Monto acumulado reciente</span>
              </div>

              <b>{formatCLP(data.last_30_days.total_sales)}</b>
            </div>
          </section>

          <section className="analytics-panel">
            <h2>Productos más vendidos</h2>

            {data.top_products.length === 0 ? (
              <p>No hay ventas registradas.</p>
            ) : (
              data.top_products.map((product) => (
                <div key={product.id} className="analytics-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.quantity_sold} unidades</span>
                  </div>

                  <b>{formatCLP(product.total_sold)}</b>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="analytics-grid analytics-grid-two">
          <section className="analytics-panel">
            <h2>Productos con bajo stock</h2>

            {data.low_stock_products.length === 0 ? (
              <p>No hay productos críticos.</p>
            ) : (
              data.low_stock_products.map((product) => (
                <div key={product.id} className="analytics-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>Mínimo: {product.min_stock}</span>
                  </div>

                  <b>{product.stock}</b>
                </div>
              ))
            )}
          </section>

          <section className="analytics-panel">
            <h2>Productos sin precio</h2>

            {data.products_without_price.length === 0 ? (
              <p>Todos los productos tienen precio.</p>
            ) : (
              data.products_without_price.map((product) => (
                <div key={product.id} className="analytics-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.barcode || "Sin código"}</span>
                  </div>

                  <b>Sin precio</b>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {activeTab === "products" && (
        <div className="analytics-grid analytics-grid-two">
          <section className="analytics-panel">
            <h2>Top productos vendidos</h2>

            {data.top_products.length === 0 ? (
              <p>No hay ventas registradas.</p>
            ) : (
              data.top_products.map((product) => (
                <div key={product.id} className="analytics-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.quantity_sold} unidades vendidas</span>
                  </div>

                  <b>{formatCLP(product.total_sold)}</b>
                </div>
              ))
            )}
          </section>

          <section className="analytics-panel">
            <h2>Alertas de productos</h2>

            <div className="analytics-row">
              <div>
                <strong>Productos con bajo stock</strong>
                <span>Requieren reposición</span>
              </div>

              <b>{data.low_stock_products.length}</b>
            </div>

            <div className="analytics-row">
              <div>
                <strong>Productos sin precio</strong>
                <span>No pueden venderse en POS</span>
              </div>

              <b>{data.products_without_price.length}</b>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
