import { useState, useCallback } from "react";
import { updateProduct } from "../services/productApi";
import type { Product } from "../types/product";

interface Props {
  product: Product;
  onUpdated?: (product: Product) => void;
}

interface FormState {
  name: string;
  price: string;
  cost: string;
  stock: string;
  barcode: string;
  category_id?: number | null;
}

export const ProductForm = ({ product, onUpdated }: Props) => {
  const [form, setForm] = useState<FormState>({
    name: product.name ?? "",
    price: product.price != null ? String(product.price) : "",
    cost: product.cost != null ? String(product.cost) : "",
    stock: product.stock != null ? String(product.stock) : "",
    barcode: product.barcode ?? "",
    category_id: product.category_id,
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
    const stock = Number(form.stock);
    const cost = form.cost.trim() === "" ? null : Number(form.cost);

    if (price !== null && (Number.isNaN(price) || price < 0)) {
      return "Precio inválido";
    }

    if (Number.isNaN(stock) || stock < 0) return "Stock inválido";

    if (cost !== null && (Number.isNaN(cost) || cost < 0)) {
      return "Costo inválido";
    }

    return null;
  };

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
      const payload = {
        name: form.name.trim(),
        price: form.price.trim() === "" ? null : Number(form.price),
        cost: form.cost.trim() === "" ? null : Number(form.cost),
        stock: Number(form.stock),
        barcode: form.barcode.trim() === "" ? null : form.barcode.trim(),
        category_id: form.category_id ?? null,
      };

      const updated = await updateProduct(product.id, payload);
      onUpdated?.(updated);
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
        <h2>Editar producto</h2>
        <p>Actualiza precio, costo, stock o código de barras.</p>
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

      <button type="submit" disabled={loading} className="product-save-button">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
};
