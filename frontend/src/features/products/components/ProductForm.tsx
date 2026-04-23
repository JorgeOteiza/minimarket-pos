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
  category_id?: number;
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

    const price = Number(form.price);
    const stock = Number(form.stock);
    const cost = Number(form.cost);

    if (isNaN(price) || price < 0) return "Precio inválido";
    if (isNaN(stock) || stock < 0) return "Stock inválido";
    if (isNaN(cost) || cost < 0) return "Costo inválido";

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
        name: form.name,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        barcode: form.barcode,
        category_id: form.category_id,
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
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <h2>Editar producto</h2>

      {error && <div className="error">{error}</div>}

      <div>
        <label>Nombre</label>
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div>
        <label>Precio venta</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
      </div>

      <div>
        <label>Costo</label>
        <input
          type="number"
          value={form.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
        />
      </div>

      <div>
        <label>Stock</label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => handleChange("stock", e.target.value)}
        />
      </div>

      <div>
        <label>Barcode</label>
        <input
          value={form.barcode}
          onChange={(e) => handleChange("barcode", e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
};
