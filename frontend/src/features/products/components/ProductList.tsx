import { useState } from "react";
import type { Product } from "../types/product";
import {
  calculateNetPrice,
  calculateProfit,
  calculateMargin,
} from "../../../utils/pricing";
import { updateProduct } from "../services/productApi";

interface Props {
  products: Product[];
  loading?: boolean;
  selectedProductId?: number | null;
  onSelectProduct: (product: Product) => void;
  onProductUpdated: (product: Product) => void;
}

export const ProductList = ({
  products,
  loading = false,
  selectedProductId = null,
  onSelectProduct,
  onProductUpdated,
}: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState("");

  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  const formatOptionalCLP = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value))
      return "-";
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
        return { label: "Sin stock", color: "#dc2626", bg: "#fee2e2" };
      case "low":
        return { label: "Stock bajo", color: "#b45309", bg: "#fef3c7" };
      default:
        return { label: "OK", color: "#166534", bg: "#dcfce7" };
    }
  };

  const handleSavePrice = async (product: Product) => {
    const value = tempPrice.trim();

    if (value !== "" && Number(value) < 0) {
      setEditingId(null);
      setTempPrice("");
      return;
    }

    try {
      const updated = await updateProduct(product.id, {
        price: value === "" ? null : Number(value),
      });

      onProductUpdated(updated);
    } catch (err) {
      console.error("Error actualizando precio", err);
    } finally {
      setEditingId(null);
      setTempPrice("");
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (!products.length) return <p>No hay productos</p>;

  return (
    <div>
      <h2>Lista de Productos</h2>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Barcode</th>
              <th>Costo caja</th>
              <th>Costo unidad</th>
              <th>Precio venta</th>
              <th>Precio sin IVA</th>
              <th>Utilidad</th>
              <th>Margen</th>
              <th>Stock</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const finalPrice = product.price ?? null;
              const boxCost = product.cost ?? null;
              const stock = product.stock ?? 0;
              const iva = product.iva ?? 0.19;

              const unitCost =
                boxCost !== null && stock > 0 ? boxCost / stock : null;

              const netPrice =
                finalPrice !== null ? calculateNetPrice(finalPrice, iva) : null;

              const profit =
                finalPrice !== null && unitCost !== null
                  ? calculateProfit(finalPrice, unitCost, iva)
                  : null;

              const marginPercent =
                profit !== null && unitCost !== null
                  ? calculateMargin(profit, unitCost).toFixed(0)
                  : null;

              const status = getStockStatus(product);
              const badge = getStockBadge(status);
              const isSelected = selectedProductId === product.id;
              const isEditing = editingId === product.id;

              return (
                <tr
                  key={product.id}
                  className={`product-row ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectProduct(product)}
                >
                  <td>{product.name}</td>
                  <td>{product.barcode || "-"}</td>
                  <td>{formatOptionalCLP(boxCost)}</td>
                  <td>{formatOptionalCLP(unitCost)}</td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product);
                      setEditingId(product.id);
                      setTempPrice(
                        finalPrice !== null ? String(finalPrice) : "",
                      );
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempPrice}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempPrice(e.target.value)}
                        onBlur={() => handleSavePrice(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSavePrice(product);
                          }

                          if (e.key === "Escape") {
                            setEditingId(null);
                            setTempPrice("");
                          }
                        }}
                      />
                    ) : finalPrice !== null ? (
                      formatCLP(finalPrice)
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{formatOptionalCLP(netPrice)}</td>

                  <td
                    className={
                      profit !== null && profit > 0
                        ? "profit-positive"
                        : "profit-negative"
                    }
                  >
                    {formatOptionalCLP(profit)}
                  </td>

                  <td>{marginPercent !== null ? `${marginPercent}%` : "-"}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
