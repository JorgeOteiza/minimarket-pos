import type { FormEvent } from "react";
import type { BulkProduct } from "../services/bulkApi";

type NumericInputValue = number | "";

type SackFormState = {
  name: string;
  barcode: string;
  package_quantity: NumericInputValue;
  unit: string;
  cost: NumericInputValue;
  sale_margin: NumericInputValue;
};

type Props = {
  isEditing: boolean;
  editingProduct: BulkProduct | null;
  loading: boolean;
  deletingProductId: number | null;
  sackForm: SackFormState;
  initialPackages: NumericInputValue;
  hasSackFormData: boolean;
  onUpdateSackForm: <K extends keyof SackFormState>(
    key: K,
    value: SackFormState[K],
  ) => void;
  onSetInitialPackages: (value: NumericInputValue) => void;
  onResetSackForm: () => void;
  onSubmit: (event: FormEvent) => void;
  onDeleteClick: () => void;
};

const BulkRestockForm = ({
  isEditing,
  editingProduct,
  loading,
  deletingProductId,
  sackForm,
  initialPackages,
  hasSackFormData,
  onUpdateSackForm,
  onSetInitialPackages,
  onResetSackForm,
  onSubmit,
  onDeleteClick,
}: Props) => {
  return (
    <section className="sack-card">
      <div className="sack-side-header">
        <div>
          <h2>
            {isEditing ? "Editar producto" : "Registrar tipo de producto"}
          </h2>
          <p>
            {isEditing
              ? "Actualiza la información del producto registrado."
              : "Crea el producto base y registra su primera llegada al historial."}
          </p>
        </div>

        {isEditing && editingProduct && (
          <button
            type="button"
            className="sack-delete-side-btn"
            onClick={onDeleteClick}
            disabled={loading || deletingProductId === editingProduct.id}
          >
            Eliminar
          </button>
        )}
      </div>

      <form className="sack-form" onSubmit={onSubmit}>
        <div className="sack-field">
          <label>Nombre del producto</label>
          <input
            type="text"
            value={sackForm.name}
            onChange={(event) => onUpdateSackForm("name", event.target.value)}
            placeholder="Ej: Alimento perro adulto 25 kg"
          />
        </div>

        <div className="sack-field">
          <label>Código del producto</label>
          <input
            type="text"
            value={sackForm.barcode}
            onChange={(event) =>
              onUpdateSackForm("barcode", event.target.value)
            }
            placeholder="Ingresa aquí el código de barras del producto"
          />
        </div>

        <div className="sack-form-grid">
          <div className="sack-field">
            <label>Cantidad/peso</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={sackForm.package_quantity}
              onChange={(event) =>
                onUpdateSackForm(
                  "package_quantity",
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              placeholder="Ej: 25"
            />
          </div>

          <div className="sack-field">
            <label>Unidad</label>
            <select
              value={sackForm.unit}
              onChange={(event) => onUpdateSackForm("unit", event.target.value)}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="unidades">unidades</option>
            </select>
          </div>
        </div>

        <div className="sack-form-grid sack-pricing-grid">
          <div className="sack-field sack-prefix">
            <label>Costo sin IVA</label>

            <div className="sack-input-wrapper">
              <span className="sack-input-prefix">$</span>

              <input
                type="number"
                min={0}
                value={sackForm.cost}
                onChange={(event) =>
                  onUpdateSackForm(
                    "cost",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
                placeholder="Ej: 20000"
              />
            </div>
          </div>

          <div className="sack-field sack-suffix">
            <label>Margen de utilidad</label>

            <div className="sack-input-wrapper">
              <input
                type="number"
                min={0}
                step="1"
                value={
                  sackForm.sale_margin === ""
                    ? ""
                    : Math.round(Number(sackForm.sale_margin) * 100)
                }
                onChange={(event) =>
                  onUpdateSackForm(
                    "sale_margin",
                    event.target.value === ""
                      ? ""
                      : Number(event.target.value) / 100,
                  )
                }
                placeholder="Ej: 40"
              />

              <span className="sack-input-suffix">%</span>
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="sack-field">
            <label>Productos recibidos ahora</label>
            <input
              type="number"
              min={1}
              value={initialPackages}
              onChange={(event) =>
                onSetInitialPackages(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              placeholder="Ej: 1"
            />
          </div>
        )}

        <div className="sack-actions">
          {hasSackFormData && (
            <button
              type="button"
              className="sack-secondary-btn"
              onClick={onResetSackForm}
              disabled={loading}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="sack-primary-btn"
            disabled={loading || !sackForm.name.trim()}
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar producto"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default BulkRestockForm;
