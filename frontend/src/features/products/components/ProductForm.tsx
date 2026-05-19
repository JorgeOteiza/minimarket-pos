import { useState } from "react";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from "../types/product";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productApi";

import { calculatePriceFromMargin } from "../../../utils/pricing";

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
  const initialFormData: CreateProductDTO = {
    name: product?.name ?? "",
    pack_units: product?.pack_units ?? product?.stock ?? null,
    price: product?.price ?? null,
    cost: product?.cost ?? null,
    barcode: product?.barcode ?? "",
    stock: product?.stock ?? 0,
    margin: product?.margin ?? 0,
    min_stock: product?.min_stock ?? 0,
    iva: product?.iva ?? 0.19,
  };

  const [formData, setFormData] = useState<CreateProductDTO>(initialFormData);

  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "name" || name === "barcode"
          ? value
          : value === ""
            ? null
            : Number(value),
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?=\d)/, "");

    const marginPercent = raw === "" ? 0 : Number(raw);

    const marginDecimal = marginPercent / 100;

    const packUnits = formData.pack_units ?? formData.stock ?? 0;

    const cost = formData.cost ?? null;

    const iva = formData.iva ?? 0.19;

    let newPrice = formData.price;

    if (cost !== null && packUnits > 0) {
      const unitCost = cost / packUnits;

      const calculated = calculatePriceFromMargin(unitCost, marginPercent, iva);

      newPrice = Math.round(calculated);
    }

    setFormData((prev) => ({
      ...prev,
      margin: marginDecimal,
      price: newPrice,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      margin: "",
      price: "",
    }));
  };

  const validateForm = () => {
    const errors: Partial<Record<string, string>> = {};

    if (!formData.name?.trim()) {
      errors.name = "Debes ingresar un nombre";
    }

    if (
      formData.pack_units === null ||
      formData.pack_units === undefined ||
      formData.pack_units <= 0
    ) {
      errors.pack_units = "Debes ingresar unidades por caja";
    }

    if (
      formData.stock === null ||
      formData.stock === undefined ||
      formData.stock < 0
    ) {
      errors.stock = "Debes ingresar stock válido";
    }

    if (
      formData.min_stock === null ||
      formData.min_stock === undefined ||
      formData.min_stock < 0
    ) {
      errors.min_stock = "Debes ingresar stock mínimo";
    }

    if (
      formData.price === null ||
      formData.price === undefined ||
      formData.price <= 0
    ) {
      errors.price = "Debes ingresar precio de venta";
    }

    if (
      formData.cost === null ||
      formData.cost === undefined ||
      formData.cost <= 0
    ) {
      errors.cost = "Debes ingresar costo";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setFieldErrors({});

    setSuccessMessage(null);

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (mode === "create") {
        const created = await createProduct(formData);

        onCreated?.(created);

        setSuccessMessage("Producto creado correctamente");

        setFormData({
          name: "",
          pack_units: null,
          price: null,
          cost: null,
          barcode: "",
          stock: 0,
          margin: 0,
          min_stock: 0,
          iva: 0.19,
        });
      }

      if (mode === "edit" && product) {
        const updated = await updateProduct(
          product.id,
          formData as UpdateProductDTO,
        );

        onUpdated?.(updated);

        setSuccessMessage("Producto actualizado correctamente");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const message = err.message;

        if (
          message.toLowerCase().includes("barcode") ||
          message.toLowerCase().includes("unique")
        ) {
          setFieldErrors({
            barcode: "El código de barras ya existe",
          });
        } else {
          setFieldErrors({
            general: message,
          });
        }
      } else {
        setFieldErrors({
          general: "Error desconocido",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || mode !== "edit") return;

    const confirmed = window.confirm(
      `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    setLoading(true);

    setFieldErrors({});

    setSuccessMessage(null);

    try {
      await deleteProduct(product.id);

      onDeleted?.(product.id);

      setSuccessMessage("Producto eliminado correctamente");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFieldErrors({
          general: err.message,
        });
      } else {
        setFieldErrors({
          general: "No se pudo eliminar el producto",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form" data-dirty={hasUnsavedChanges}>
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

      <form onSubmit={handleSubmit} className="product-form-body">
        <div className="form-grid">
          <div className="form-field">
            <label>Nombre</label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? "input-error" : ""}
            />

            {fieldErrors.name && (
              <span className="field-error">{fieldErrors.name}</span>
            )}
          </div>

          <div className="form-field">
            <label>Código de barras</label>

            <input
              name="barcode"
              value={formData.barcode ?? ""}
              onChange={handleChange}
              className={fieldErrors.barcode ? "input-error" : ""}
            />

            {fieldErrors.barcode && (
              <span className="field-error">{fieldErrors.barcode}</span>
            )}
          </div>

          <div className="form-field">
            <label>Costo caja</label>

            <input
              name="cost"
              type="number"
              value={formData.cost ?? ""}
              onChange={handleChange}
              className={fieldErrors.cost ? "input-error" : ""}
            />

            {fieldErrors.cost && (
              <span className="field-error">{fieldErrors.cost}</span>
            )}
          </div>

          <div className="form-field">
            <label>Unidades por caja</label>

            <input
              name="pack_units"
              type="number"
              value={formData.pack_units ?? ""}
              onChange={handleChange}
              className={fieldErrors.pack_units ? "input-error" : ""}
            />

            {fieldErrors.pack_units && (
              <span className="field-error">{fieldErrors.pack_units}</span>
            )}
          </div>

          <div className="form-field">
            <label>Stock disponible</label>

            <input
              name="stock"
              type="number"
              value={formData.stock ?? ""}
              onChange={handleChange}
              className={fieldErrors.stock ? "input-error" : ""}
            />

            {fieldErrors.stock && (
              <span className="field-error">{fieldErrors.stock}</span>
            )}
          </div>

          <div className="form-field">
            <label>Precio venta</label>

            <input
              name="price"
              type="number"
              value={formData.price ?? ""}
              onChange={handleChange}
              className={fieldErrors.price ? "input-error" : ""}
            />

            {fieldErrors.price && (
              <span className="field-error">{fieldErrors.price}</span>
            )}
          </div>

          <div className="form-field">
            <label>Margen (%)</label>

            <input
              type="number"
              value={
                formData.margin && formData.margin > 0
                  ? Math.round(formData.margin * 100)
                  : ""
              }
              onChange={handleMarginChange}
            />
          </div>

          <div className="form-field">
            <label>Stock mínimo</label>

            <input
              name="min_stock"
              type="number"
              value={formData.min_stock ?? ""}
              onChange={handleChange}
              className={fieldErrors.min_stock ? "input-error" : ""}
            />

            {fieldErrors.min_stock && (
              <span className="field-error">{fieldErrors.min_stock}</span>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="form-success-message">✓ {successMessage}</div>
        )}

        {fieldErrors.general && (
          <div className="form-error-message">✕ {fieldErrors.general}</div>
        )}

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

                if (!confirmed) return;
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
