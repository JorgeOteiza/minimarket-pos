import type { Product } from "../types/product";

import {
  calculateProfit,
  calculateMargin,
  calculateCostWithIva,
} from "../../../utils/pricing";

interface Props {
  products: Product[];
  loading?: boolean;
  selectedProductId?: number | null;
  onHighlightProduct: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAdjustInventory: (product: Product) => void;
}

export const ProductList = ({
  products,
  loading = false,
  selectedProductId = null,
  onHighlightProduct,
  onSelectProduct,
  onAdjustInventory,
}: Props) => {
  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Math.round(value));

  const formatOptionalCLP = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "-";
    }

    return formatCLP(value);
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stock ?? 0;
    const minStock = product.min_stock ?? 0;

    if (stock <= 0) return "out";

    if (minStock > 0 && stock <= minStock) return "low";

    const warningBuffer = Math.max(2, Math.ceil(minStock * 0.25));

    if (minStock > 0 && stock <= minStock + warningBuffer) {
      return "warning";
    }

    return "ok";
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "out":
        return {
          label: "Sin stock",
          color: "#991b1b",
          bg: "#fee2e2",
          border: "#fca5a5",
        };

      case "low":
        return {
          label: "Stock bajo",
          color: "#b91c1c",
          bg: "#ffe4e6",
          border: "#fda4af",
        };

      case "warning":
        return {
          label: "Por revisar",
          color: "#92400e",
          bg: "#fef3c7",
          border: "#fcd34d",
        };

      default:
        return {
          label: "OK",
          color: "#166534",
          bg: "#dcfce7",
          border: "#86efac",
        };
    }
  };

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (!products.length) {
    return <p>No hay productos</p>;
  }

  return (
    <div>
      <h2>Lista de Productos</h2>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Nombre del producto</th>
              <th>Barcode</th>
              <th>Costo caja</th>
              <th>Unid. caja</th>
              <th>Costo unidad</th>
              <th>Precio con IVA</th>
              <th>Precio venta</th>
              <th>Utilidad</th>
              <th>Margen</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const finalPrice = product.price ?? null;
              const boxCost = product.cost ?? null;
              const stock = product.stock ?? 0;

              const packUnits = product.pack_units ?? stock;
              const iva = product.iva ?? 0.19;

              const unitCost =
                boxCost !== null && packUnits > 0 ? boxCost / packUnits : null;

              const costWithIva =
                unitCost !== null ? calculateCostWithIva(unitCost, iva) : null;

              const profit =
                finalPrice !== null && unitCost !== null
                  ? calculateProfit(finalPrice, unitCost, iva)
                  : null;

              const realMarginPercent =
                profit !== null && unitCost !== null
                  ? calculateMargin(profit, unitCost)
                  : null;

              const status = getStockStatus(product);
              const badge = getStockBadge(status);
              const isSelected = selectedProductId === product.id;

              return (
                <tr
                  key={product.id}
                  className={`product-row ${isSelected ? "selected" : ""}`}
                  onClick={() => onHighlightProduct(product)}
                >
                  <td>{product.name.toUpperCase()}</td>
                  <td>{product.barcode || "-"}</td>
                  <td>{formatOptionalCLP(boxCost)}</td>
                  <td>{packUnits || "-"}</td>
                  <td>{formatOptionalCLP(unitCost)}</td>
                  <td>{formatOptionalCLP(costWithIva)}</td>
                  <td>{finalPrice !== null ? formatCLP(finalPrice) : "-"}</td>

                  <td
                    className={
                      profit !== null && profit > 0
                        ? "profit-positive"
                        : "profit-negative"
                    }
                  >
                    {formatOptionalCLP(profit)}
                  </td>

                  <td>
                    {realMarginPercent !== null
                      ? `${realMarginPercent.toFixed(0)}%`
                      : "-"}
                  </td>

                  <td>{stock}</td>

                  <td>
                    <span
                      className="stock-badge"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="product-action-btn edit-product-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                      >
                        <span>✏️</span>
                        Editar
                      </button>

                      <button
                        type="button"
                        className="product-action-btn inventory-product-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustInventory(product);
                        }}
                      >
                        <span>📦</span>
                        Inventario
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
