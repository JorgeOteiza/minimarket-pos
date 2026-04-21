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
  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return "out";
    if (product.stock <= (product.min_stock ?? 0)) return "low";
    return "ok";
  };

  const getRowStyle = (status: string) => {
    switch (status) {
      case "out":
        return { background: "#fee2e2" }; // rojo suave
      case "low":
        return { background: "#fef3c7" }; // amarillo
      default:
        return {};
    }
  };

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (products.length === 0) {
    return <p>No hay productos disponibles</p>;
  }

  return (
    <div>
      <h2>Lista de Productos</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Costo</th>
            <th>Margen</th>
            <th>Utilidad</th>
            <th>Stock</th>
            <th>Barcode</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const cost = product.cost ?? 0;
            const profit = product.price - cost;

            const marginPercent =
              cost > 0 ? ((profit / cost) * 100).toFixed(0) : "0";

            const status = getStockStatus(product);

            return (
              <tr
                key={product.id}
                onClick={() => onSelectProduct(product)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  transition: "all 0.15s ease",
                  ...getRowStyle(status),
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>${cost}</td>
                <td>{marginPercent}%</td>
                <td
                  style={{
                    color: profit > 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "bold",
                  }}
                >
                  ${profit}
                </td>
                <td>{product.stock}</td>
                <td>{product.barcode}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
