import { useEffect, useState, useCallback } from "react";
import { updateProduct } from "../services/productApi";
import type { Product, UpdateProductDTO } from "../types/product";

interface Props {
  product: Product;
  onUpdated?: (product: Product) => void;
}

export const ProductForm = ({ product, onUpdated }: Props) => {
  const [form, setForm] = useState<UpdateProductDTO>({
    name: "",
    price: 0,
    stock: 0,
    barcode: "",
    cost: 0,
    category_id: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 sincroniza cuando cambia el producto seleccionado
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        stock: product.stock,
        barcode: product.barcode,
        cost: product.cost ?? 0,
        category_id: product.category_id,
      });
    }
  }, [product]);

  // 🧠 handler genérico
  const handleChange = useCallback(
    (field: keyof UpdateProductDTO, value: string | number) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // ✅ validación simple (puedes escalar esto después)
  const validate = (): string | null => {
    if (!form.name.trim()) return "El nombre es obligatorio";
    if (form.price < 0) return "El precio no puede ser negativo";
    if (form.stock < 0) return "El stock no puede ser negativo";
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
      const updated = await updateProduct(product.id, form);
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

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div>
        <label>Nombre</label>
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div>
        <label>Precio</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
        />
      </div>

      <div>
        <label>Costo</label>
        <input
          type="number"
          value={form.cost}
          onChange={(e) => handleChange("cost", Number(e.target.value))}
        />
      </div>

      <div>
        <label>Stock</label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => handleChange("stock", Number(e.target.value))}
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
