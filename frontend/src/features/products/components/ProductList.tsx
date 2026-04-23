import type { Product } from "../types/product";

interface Props {
  products: Product[];
  loading?: boolean;
  onSelectProduct: (product: Product) => void;
}

export const ProductList = ({
  products,
  loading = false,
  onSelectProduct,
}: Props) => {
  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

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

  if (loading) return <p>Cargando productos...</p>;
  if (!products.length) return <p>No hay productos</p>;

  return (
    <div>
      <h2>Lista de Productos</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th>Nombre</th>
            <th>Barcode</th>

            <th>Costo neto</th>
            <th>Precio venta</th>
            <th>Precio c/IVA</th>

            <th>Utilidad</th>
            <th>Margen</th>

            <th>Stock</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const cost = product.cost ?? 0;
            const iva = product.iva ?? 0.19;

            const priceNet = product.price;
            const priceWithIVA = priceNet * (1 + iva);

            const profit = priceNet - cost;
            const marginPercent =
              cost > 0 ? ((profit / cost) * 100).toFixed(0) : "0";

            const status = getStockStatus(product);
            const badge = getStockBadge(status);

            return (
              <tr
                key={product.id}
                onClick={() => onSelectProduct(product)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                <td>{product.name}</td>
                <td>{product.barcode || "-"}</td>

                <td>{formatCLP(cost)}</td>
                <td>{formatCLP(priceNet)}</td>
                <td>{formatCLP(priceWithIVA)}</td>

                <td
                  style={{
                    color: profit > 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  {formatCLP(profit)}
                </td>

                <td>{marginPercent}%</td>

                <td>{product.stock}</td>

                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "bold",
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
  );
};
