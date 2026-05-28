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
  onSelectProduct: (product: Product) => void;
  onAdjustInventory: (product: Product) => void;
}

export const ProductList = ({
  products,
  loading = false,
  selectedProductId = null,
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
    if (product.stock === 0) return "out";
    if (product.stock <= (product.min_stock ?? 0)) return "low";
    return "ok";
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "out":
        return {
          label: "Sin stock",
          color: "#dc2626",
          bg: "#fee2e2",
        };

      case "low":
        return {
          label: "Stock bajo",
          color: "#b45309",
          bg: "#fef3c7",
        };

      default:
        return {
          label: "OK",
          color: "#166534",
          bg: "#dcfce7",
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
                >
                  <td>{product.name}</td>

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
                      }}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="edit-product-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inventory-product-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        onAdjustInventory(product);
                      }}
                    >
                      Inventario
                    </button>
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
