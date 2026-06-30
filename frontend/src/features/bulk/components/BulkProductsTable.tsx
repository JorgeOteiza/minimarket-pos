import type { BulkProduct } from "../services/bulkApi";

type Props = {
  products: BulkProduct[];
  deletingProductId: number | null;
  onEdit: (product: BulkProduct) => void;
  formatCurrency: (value: number | null) => string;
  getKgPricing: (product: BulkProduct) => {
    margin: number;
    costPerKgWithoutIva: number;
    costPerKgWithIva: number;
    salePricePerKg: number;
  } | null;
};

const BulkProductsTable = ({
  products,
  deletingProductId,
  onEdit,
  formatCurrency,
  getKgPricing,
}: Props) => {
  return (
    <section className="sack-card">
      <div className="inventory-history-header">
        <div>
          <h2>Productos registrados</h2>
          <p>
            Formatos guardados y precio referencial de venta por kg para sacos
            de alimentos.
          </p>
        </div>

        <span>{products.length} productos</span>
      </div>

      <div className="sack-table-wrapper">
        <table className="sack-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Formato</th>
              <th>Costo</th>
              <th>$/kg sin IVA</th>
              <th>$/kg + IVA</th>
              <th>Margen</th>
              <th>Venta kg</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const pricing = getKgPricing(product);
              const isDeleting = deletingProductId === product.id;

              return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.barcode || "—"}</td>
                  <td>
                    <span className="sack-badge">
                      {product.package_quantity} {product.unit}
                    </span>
                  </td>
                  <td>{formatCurrency(product.cost)}</td>
                  <td>
                    {pricing
                      ? formatCurrency(pricing.costPerKgWithoutIva)
                      : "—"}
                  </td>
                  <td>
                    {pricing ? formatCurrency(pricing.costPerKgWithIva) : "—"}
                  </td>
                  <td>
                    {pricing ? `${Math.round(pricing.margin * 100)}%` : "—"}
                  </td>
                  <td>
                    <strong className="sack-sale-price">
                      {pricing ? formatCurrency(pricing.salePricePerKg) : "—"}
                    </strong>
                  </td>
                  <td>
                    <div className="sack-table-actions">
                      <button
                        type="button"
                        className="sack-edit-btn"
                        onClick={() => onEdit(product)}
                        disabled={isDeleting}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td colSpan={9}>No hay productos registrados todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BulkProductsTable;
