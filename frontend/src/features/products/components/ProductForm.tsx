import { useMemo, useState } from "react";
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
  const [formData, setFormData] = useState<CreateProductDTO>({
    name: product?.name ?? "",
    pack_units: product?.pack_units ?? product?.stock ?? null,
    price: product?.price ?? null,
    cost: product?.cost ?? null,
    barcode: product?.barcode ?? "",
    stock: product?.stock ?? 0,
    margin: product?.margin ?? 0,
    min_stock: product?.min_stock ?? 0,
    iva: product?.iva ?? 0.19,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialData = useMemo(
    () => ({
      name: product?.name ?? "",
      pack_units: product?.pack_units ?? product?.stock ?? null,
      price: product?.price ?? null,
      cost: product?.cost ?? null,
      barcode: product?.barcode ?? "",
      stock: product?.stock ?? 0,
      margin: product?.margin ?? 0,
      min_stock: product?.min_stock ?? 0,
      iva: product?.iva ?? 0.19,
    }),
    [product],
  );

  const hasUnsavedChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData);

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
  };

  // 🔥 Cambio importante: margen controla precio
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        const created = await createProduct(formData);
        onCreated?.(created);
      } else if (mode === "edit" && product) {
        const updated = await updateProduct(
          product.id,
          formData as UpdateProductDTO,
        );
        onUpdated?.(updated);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
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
    setError(null);

    try {
      await deleteProduct(product.id);
      onDeleted?.(product.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo eliminar el producto");
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
              : "Modifica precio, margen o stock."}
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
              required
            />
          </div>

          <div className="form-field">
            <label>Código de barras</label>
            <input
              name="barcode"
              value={formData.barcode ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Costo caja</label>
            <input
              name="cost"
              type="number"
              value={formData.cost ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Unidades por caja</label>
            <input
              name="pack_units"
              type="number"
              value={formData.pack_units ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Stock disponible</label>
            <input
              name="stock"
              type="number"
              value={formData.stock ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Precio venta</label>
            <input
              name="price"
              type="number"
              value={formData.price ?? ""}
              onChange={handleChange}
            />
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
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="product-form-actions">
          <button type="submit" disabled={loading} className="primary-btn">
            {mode === "create" ? "Crear" : "Guardar"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirmed = window.confirm(
                  "Tienes cambios sin guardar. ¿Cerrar igualmente?",
                );

                if (!confirmed) return;
              }

              onCancel();
            }}
            className="secondary-btn"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
