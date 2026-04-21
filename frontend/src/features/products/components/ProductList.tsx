import type { Product } from "../types/product";

interface Props {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  loading?: boolean;
}

export const ProductList = ({
  products,
  onSelectProduct,
  loading = false,
}: Props) => {
  return (
    <div>
      <h2>Lista de Productos</h2>

      {loading && <p>Cargando...</p>}

      {!loading && products.length === 0 && (
        <p style={{ opacity: 0.6 }}>No hay productos</p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Barcode</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onSelectProduct(product)}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.barcode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
