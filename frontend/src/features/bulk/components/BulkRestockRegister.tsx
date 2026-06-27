import type { FormEvent } from "react";
import type { BulkProduct } from "../services/bulkApi";

type Props = {
  loading: boolean;
  restockBarcode: string;
  quantityPackages: number | "";
  note: string;
  selectedProduct: BulkProduct | null;
  onBarcodeChange: (value: string) => void;
  onQuantityChange: (value: number | "") => void;
  onNoteChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  formatCurrency: (value: number | null) => string;
};

const BulkRestockRegister = ({
  loading,
  restockBarcode,
  quantityPackages,
  note,
  selectedProduct,
  onBarcodeChange,
  onQuantityChange,
  onNoteChange,
  onSubmit,
  formatCurrency,
}: Props) => {
  return (
    <section className="sack-card">
      <h2>Registrar nueva reposición</h2>
      <p>Escanea el código del producto cuando llegue mercadería.</p>

      <form className="sack-form" onSubmit={onSubmit}>
        <div className="sack-form-grid">
          <div className="sack-field full">
            <label>Código del saco/paquete</label>
            <input
              type="text"
              value={restockBarcode}
              onChange={(event) => onBarcodeChange(event.target.value)}
              placeholder="Escanear o escribir código..."
              autoFocus
            />
          </div>

          {restockBarcode.trim() && (
            <div
              className={
                selectedProduct
                  ? "sack-status success sack-field full"
                  : "sack-status warning sack-field full"
              }
            >
              {selectedProduct
                ? `Producto detectado: ${selectedProduct.name}`
                : "No se encontró un producto registrado con ese código."}
            </div>
          )}

          <div className="sack-field">
            <label>Cantidad de sacos/paquetes</label>
            <input
              type="number"
              min={1}
              value={quantityPackages}
              onChange={(event) =>
                onQuantityChange(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            />
          </div>

          <div className="sack-field">
            <label>Nota</label>
            <input
              type="text"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        {selectedProduct && (
          <div className="sack-summary">
            <div>
              <span>Producto</span>
              <strong>{selectedProduct.name}</strong>
            </div>

            <div>
              <span>Formato</span>
              <strong>
                {selectedProduct.package_quantity} {selectedProduct.unit}
              </strong>
            </div>

            <div>
              <span>Costo producto</span>
              <strong>{formatCurrency(selectedProduct.cost)}</strong>
            </div>
          </div>
        )}

        <div className="sack-actions">
          <button
            type="submit"
            className="sack-primary-btn"
            disabled={loading || !selectedProduct}
          >
            {loading ? "Registrando..." : "Registrar reposición"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default BulkRestockRegister;
