import { useState } from "react";
import type { Product } from "../types/product";
import {
  calculateProfit,
  calculateMargin,
  calculateCostWithIva,
  calculatePriceFromMargin,
} from "../../../utils/pricing";
import { updateProduct } from "../services/productApi";

type EditingField = "price" | "margin" | "stock" | "unitCost" | "packUnits";

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
  const [editing, setEditing] = useState<{
    productId: number;
    field: EditingField;
  } | null>(null);

  const [tempValue, setTempValue] = useState("");

  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Math.round(value));

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

  const startEditing = (
    product: Product,
    field: EditingField,
    initialValue: string,
  ) => {
    onSelectProduct(product);
    setEditing({ productId: product.id, field });
    setTempValue(initialValue);
  };

  const cancelEditing = () => {
    setEditing(null);
    setTempValue("");
  };

  const saveInlineEdit = async (product: Product) => {
    if (!editing) return;

    const rawValue = tempValue.trim();
    const numericValue = rawValue === "" ? null : Number(rawValue);

    if (
      numericValue !== null &&
      (Number.isNaN(numericValue) || numericValue < 0)
    ) {
      cancelEditing();
      return;
    }

    try {
      if (editing.field === "packUnits") {
        const updated = await updateProduct(product.id, {
          pack_units: numericValue === null ? null : Math.floor(numericValue),
        });
        onProductUpdated(updated);
      }

      if (editing.field === "price") {
        const updated = await updateProduct(product.id, {
          price: numericValue,
        });
        onProductUpdated(updated);
      }

      if (editing.field === "margin") {
        const packUnits = product.pack_units ?? product.stock ?? 0;
        const boxCost = product.cost ?? null;
        const iva = product.iva ?? 0.19;

        const unitCost =
          boxCost !== null && packUnits > 0 ? boxCost / packUnits : null;

        if (numericValue === null || unitCost === null) {
          cancelEditing();
          return;
        }

        const newPrice = calculatePriceFromMargin(unitCost, numericValue, iva);

        const updated = await updateProduct(product.id, {
          margin: numericValue / 100,
          price: Math.round(newPrice),
        });

        onProductUpdated(updated);
      }

      if (editing.field === "stock") {
        const updated = await updateProduct(product.id, {
          stock: numericValue === null ? 0 : Math.floor(numericValue),
        });
        onProductUpdated(updated);
      }

      if (editing.field === "unitCost") {
        const safePackUnits = product.pack_units ?? product.stock ?? 1;

        const updated = await updateProduct(product.id, {
          cost: numericValue === null ? null : numericValue * safePackUnits,
        });
        onProductUpdated(updated);
      }
    } catch (err) {
      console.error("Error actualizando producto", err);
    } finally {
      cancelEditing();
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

              const isEditingPrice =
                editing?.productId === product.id && editing.field === "price";

              const isEditingMargin =
                editing?.productId === product.id && editing.field === "margin";

              const isEditingStock =
                editing?.productId === product.id && editing.field === "stock";

              const isEditingUnitCost =
                editing?.productId === product.id &&
                editing.field === "unitCost";

              const isEditingPackUnits =
                editing?.productId === product.id &&
                editing.field === "packUnits";

              return (
                <tr
                  key={product.id}
                  className={`product-row ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectProduct(product)}
                >
                  <td>{product.name}</td>
                  <td>{product.barcode || "-"}</td>
                  <td>{formatOptionalCLP(boxCost)}</td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(product, "packUnits", String(packUnits));
                    }}
                  >
                    {isEditingPackUnits ? (
                      <input
                        type="number"
                        value={tempValue}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInlineEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(product);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    ) : (
                      packUnits || "-"
                    )}
                  </td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(
                        product,
                        "unitCost",
                        unitCost !== null ? String(Math.round(unitCost)) : "",
                      );
                    }}
                  >
                    {isEditingUnitCost ? (
                      <input
                        type="number"
                        value={tempValue}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInlineEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(product);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    ) : (
                      formatOptionalCLP(unitCost)
                    )}
                  </td>

                  <td>{formatOptionalCLP(costWithIva)}</td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(
                        product,
                        "price",
                        finalPrice !== null ? String(finalPrice) : "",
                      );
                    }}
                  >
                    {isEditingPrice ? (
                      <input
                        type="number"
                        value={tempValue}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInlineEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(product);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    ) : finalPrice !== null ? (
                      formatCLP(finalPrice)
                    ) : (
                      "-"
                    )}
                  </td>

                  <td
                    className={
                      profit !== null && profit > 0
                        ? "profit-positive"
                        : "profit-negative"
                    }
                  >
                    {formatOptionalCLP(profit)}
                  </td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(
                        product,
                        "margin",
                        realMarginPercent !== null
                          ? realMarginPercent.toFixed(0)
                          : "",
                      );
                    }}
                  >
                    {isEditingMargin ? (
                      <input
                        type="number"
                        value={tempValue}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInlineEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(product);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    ) : realMarginPercent !== null ? (
                      `${realMarginPercent.toFixed(0)}%`
                    ) : (
                      "-"
                    )}
                  </td>

                  <td
                    className="editable-price-cell"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(product, "stock", String(stock));
                    }}
                  >
                    {isEditingStock ? (
                      <input
                        type="number"
                        value={tempValue}
                        autoFocus
                        className="inline-price-input"
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveInlineEdit(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(product);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                    ) : (
                      stock
                    )}
                  </td>

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
