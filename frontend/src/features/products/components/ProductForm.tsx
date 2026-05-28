import type { Product } from "../types/product";

import { useProductForm } from "../hooks/useProductForm";

import { FormField } from "../../../components/ui/FormField";

type Props = {
  mode: "create" | "edit";
  product?: Product;
  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  onDeleted?: (productId: number) => void;
  onCancel: () => void;
};

export const ProductForm = ({
  mode,
  product,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel,
}: Props) => {
  const {
    formData,

    loading,

    fieldErrors,
    successMessage,
    warnings,

    hasUnsavedChanges,

    handleChange,
    handleSubmit,
    handleDelete,
  } = useProductForm({
    mode,
    product,
    onCreated,
    onUpdated,
    onDeleted,
  });

  return (
    <div className="product-form" data-dirty={hasUnsavedChanges}>
      {/* =========================
          HEADER
      ========================= */}

      <div className="product-form-header">
        <div>
          <h2>{mode === "create" ? "Agregar producto" : "Editar producto"}</h2>

          <p>
            {mode === "create"
              ? "Ingresa los datos del producto."
              : "Actualiza la información general."}
          </p>
        </div>

        {mode === "edit" && product && (
          <button
            type="button"
            className="product-delete-button"
            onClick={handleDelete}
            disabled={loading}
          >
            Eliminar
          </button>
        )}
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form onSubmit={handleSubmit} className="product-form-body">
        <div className="form-grid">
          <FormField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />

          <FormField
            label="Código de barras"
            name="barcode"
            value={formData.barcode ?? ""}
            onChange={handleChange}
            error={fieldErrors.barcode}
            warning={warnings.barcode}
          />

          <FormField
            label="Costo caja"
            name="cost"
            type="number"
            value={formData.cost}
            onChange={handleChange}
            error={fieldErrors.cost}
          />

          <FormField
            label="Unidades por caja"
            name="pack_units"
            type="number"
            value={formData.pack_units}
            onChange={handleChange}
            error={fieldErrors.pack_units}
          />

          {mode === "create" && (
            <FormField
              label="Stock inicial"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={fieldErrors.stock}
              warning={warnings.stock}
            />
          )}

          <FormField
            label="Precio venta"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={fieldErrors.price}
            warning={warnings.price}
          />

          <FormField
            label="Stock mínimo"
            name="min_stock"
            type="number"
            value={formData.min_stock}
            onChange={handleChange}
            error={fieldErrors.min_stock}
            warning={warnings.stock}
          />
        </div>

        {/* =========================
            MENSAJES GLOBALES
        ========================= */}

        {successMessage && (
          <div className="form-success-message">✓ {successMessage}</div>
        )}

        {fieldErrors.general && (
          <div className="form-error-message">✕ {fieldErrors.general}</div>
        )}

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="product-form-actions">
          <button type="submit" disabled={loading} className="primary-btn">
            {mode === "create" ? "Guardar producto" : "Guardar cambios"}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmed = window.confirm(
                  "Tienes cambios sin guardar. ¿Cerrar igualmente?",
                );

                if (!confirmed) {
                  return;
                }
              }

              onCancel();
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
