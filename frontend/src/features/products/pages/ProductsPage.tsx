import { useEffect, useState } from "react";
import { ProductList } from "../components/ProductList";
import { ProductForm } from "../components/ProductForm";
import type { Product } from "../types/product";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  // 🔄 carga inicial + búsqueda
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = query
          ? `http://localhost:5000/api/products/search?name=${query}`
          : `http://localhost:5000/api/products`;

        const res = await fetch(url, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Error al obtener productos");
        }

        const data = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      loadProducts();
    }, 300); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort(); // 🔥 cancela requests pendientes
    };
  }, [query]);

  // 🔥 update inmediato en UI
  const handleProductUpdated = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    setSelectedProduct(updated);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Productos</h1>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* ⚠️ ERROR */}
      {error && <div className="error">{error}</div>}

      {/* 📦 LISTA */}
      <ProductList
        products={products}
        loading={loading}
        onSelectProduct={setSelectedProduct}
      />

      {/* 📝 FORM */}
      {selectedProduct && (
        <ProductForm
          key={selectedProduct.id}
          product={selectedProduct}
          onUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default ProductsPage;
