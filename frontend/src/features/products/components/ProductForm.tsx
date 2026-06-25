import { useState } from "react";

import type { Product } from "../types/product";

import { useProductForm } from "../hooks/useProductForm";

import { FormField } from "../../../components/ui/FormField";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

type Props = {
  mode: "create" | "edit";
  product?: Product;
  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  onDeleted?: (productId: number) => void;
  onCancel: () => void;
};

type ConfirmAction = "delete" | "cancel" | null;

export const ProductForm = ({
  mode,
  product,
  onCreated,
  onUpdated,
  onDeleted,
  onCancel,
}: Props) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const {
    formData,
    marginPercentInput,

    loading,

    fieldErrors,
    successMessage,
    warnings,

    hasUnsavedChanges,

    handleChange,
    handleMarginChange,
    handleSubmit,
    handleDelete,
  } = useProductForm({
    mode,
    product,
    onCreated,
    onUpdated,
    onDeleted,
  });

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setConfirmAction("cancel");
      return;
    }

    onCancel();
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "cancel") {
      setConfirmAction(null);
      onCancel();
      return;
    }

    if (confirmAction === "delete") {
      await handleDelete();
      setConfirmAction(null);
    }
  };

  const dialogTitle =
    confirmAction === "delete" ? "Eliminar producto" : "Cerrar formulario";

  const dialogDescription =
    confirmAction === "delete"
      ? `¿Seguro que quieres eliminar "${product?.name}"? Esta acción no se puede deshacer.`
      : "Tienes cambios sin guardar. Si cierras el formulario, se perderán los cambios realizados.";

  const confirmLabel =
    confirmAction === "delete" ? "Eliminar producto" : "Cerrar sin guardar";

  return (
    <div className="product-form" data-dirty={hasUnsavedChanges}>
      <div className="product-form-header">
        <div>
          <h2>{mode === "create" ? "Agregar producto" : "Editar producto"}</h2>

          <p>
            {mode === "create"
              ? "Ingresa los datos del producto. El stock se administra desde Inventario."
              : "Actualiza la información general."}
          </p>
        </div>

        {mode === "edit" && product && (
          <button
            type="button"
            className="product-delete-button"
            onClick={() => setConfirmAction("delete")}
            disabled={loading}
          >
            Eliminar
          </button>
        )}
      </div>

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

          <div className="form-field">
            <label>Costo unidad</label>
            <input
              type="text"
              value={
                formData.cost && formData.pack_units && formData.pack_units > 0
                  ? new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      maximumFractionDigits: 0,
                    }).format(
                      Math.round(
                        Number(formData.cost) / Number(formData.pack_units),
                      ),
                    )
                  : "-"
              }
              readOnly
              className="readonly-input"
            />
          </div>

          <FormField
            label="Margen de venta (%)"
            name="margin"
            type="number"
            value={marginPercentInput}
            onChange={handleMarginChange}
            error={fieldErrors.margin}
            className="margin-highlight-input"
          />

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

        <div className="form-help-box">
          Para modificar el stock, vuelve a la lista de{" "}
          <strong>Productos</strong> y usa el botón <strong>Inventario</strong>{" "}
          del producto correspondiente.
        </div>

        {successMessage && (
          <div className="form-success-message">✓ {successMessage}</div>
        )}

        {fieldErrors.general && (
          <div className="form-error-message">✕ {fieldErrors.general}</div>
        )}

        <div className="product-form-actions">
          <button
            type="submit"
            disabled={loading || !hasUnsavedChanges}
            className="primary-btn"
          >
            {mode === "create" ? "Guardar producto" : "Guardar cambios"}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleCancelClick}
          >
            Cancelar
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmAction !== null}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        cancelLabel="Volver"
        variant={confirmAction === "delete" ? "danger" : "warning"}
        loading={loading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
