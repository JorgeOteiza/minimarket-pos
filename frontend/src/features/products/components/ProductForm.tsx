import { useState, useCallback } from "react";
import { createProduct, updateProduct } from "../services/productApi";
import type { Product } from "../types/product";

interface Props {
  product?: Product | null;
  mode: "create" | "edit";
  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  onCancel?: () => void;
}

interface FormState {
  name: string;
  price: string;
  cost: string;
  stock: string;
  barcode: string;
  category_id?: number | null;
}

export const ProductForm = ({
  product,
  mode,
  onCreated,
  onUpdated,
  onCancel,
}: Props) => {
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    price: product?.price != null ? String(product.price) : "",
    cost: product?.cost != null ? String(product.cost) : "",
    stock: product?.stock != null ? String(product.stock) : "0",
    barcode: product?.barcode ?? "",
    category_id: product?.category_id ?? null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validate = (): string | null => {
    if (!form.name.trim()) return "El nombre es obligatorio";

    const price = form.price.trim() === "" ? null : Number(form.price);
    const cost = form.cost.trim() === "" ? null : Number(form.cost);
    const stock = Number(form.stock);

    if (price !== null && (Number.isNaN(price) || price < 0)) {
      return "Precio inválido";
    }

    if (cost !== null && (Number.isNaN(cost) || cost < 0)) {
      return "Costo inválido";
    }

    if (Number.isNaN(stock) || stock < 0) return "Stock inválido";

    return null;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    price: form.price.trim() === "" ? null : Number(form.price),
    cost: form.cost.trim() === "" ? null : Number(form.cost),
    stock: Number(form.stock),
    barcode: form.barcode.trim() === "" ? null : form.barcode.trim(),
    category_id: form.category_id ?? null,
    min_stock: product?.min_stock ?? 5,
    margin: product?.margin ?? 0.3,
    is_weighted: product?.is_weighted ?? false,
    weight: product?.weight ?? null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = buildPayload();

      if (mode === "create") {
        const created = await createProduct(payload);
        onCreated?.(created);
      } else {
        if (!product) return;
        const updated = await updateProduct(product.id, payload);
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

  return (
    <form onSubmit={handleSubmit} className="product-form-card">
      <div className="product-form-header">
        <h2>{mode === "create" ? "Agregar producto" : "Editar producto"}</h2>
        <p>
          {mode === "create"
            ? "Ingresa los datos básicos del nuevo producto."
            : "Actualiza precio, costo, stock o código de barras."}
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="product-form-grid">
        <div className="form-field full">
          <label>Nombre</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Precio venta</label>
          <input
            type="number"
            value={form.price}
            placeholder="-"
            onChange={(e) => handleChange("price", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Costo caja</label>
          <input
            type="number"
            value={form.cost}
            placeholder="-"
            onChange={(e) => handleChange("cost", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Barcode</label>
          <input
            value={form.barcode}
            placeholder="-"
            onChange={(e) => handleChange("barcode", e.target.value)}
          />
        </div>
      </div>

      <div className="product-form-actions">
        {onCancel && (
          <button
            type="button"
            className="product-cancel-button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="product-save-button"
        >
          {loading
            ? "Guardando..."
            : mode === "create"
              ? "Crear producto"
              : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
};
