import { useEffect, useState } from "react";
import { ProductList } from "../components/ProductList";
import { ProductForm } from "../components/ProductForm";
import type { Product } from "../types/product";

type FormMode = "create" | "edit" | null;

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = query
          ? `http://localhost:5000/api/products/search?name=${query}`
          : "http://localhost:5000/api/products";

        const res = await fetch(url, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Error al obtener productos");
        }

        const data = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadProducts, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode("create");
  };

  const handleProductCreated = (created: Product) => {
    setProducts((prev) => [created, ...prev]);
    setSelectedProduct(created);
    setFormMode("edit");
  };

  const handleProductUpdated = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct(updated);
    setFormMode("edit");
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedProduct(null);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Gestión de Productos</h1>
          <p>Administra costos, precios, stock e inventario.</p>
        </div>

        <button className="add-product-button" onClick={handleAddProduct}>
          + Agregar producto
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="products-search"
      />

      {error && <div className="error">{error}</div>}

      <div className="products-layout">
        <div className="products-list-panel">
          <ProductList
            products={products}
            loading={loading}
            selectedProductId={selectedProduct?.id ?? null}
            onSelectProduct={handleSelectProduct}
            onProductUpdated={handleProductUpdated}
          />
        </div>

        <div className="products-form-panel">
          {formMode === "create" && (
            <ProductForm
              mode="create"
              onCreated={handleProductCreated}
              onCancel={handleCancelForm}
            />
          )}

          {formMode === "edit" && selectedProduct && (
            <ProductForm
              key={selectedProduct.id}
              mode="edit"
              product={selectedProduct}
              onUpdated={handleProductUpdated}
              onCancel={handleCancelForm}
            />
          )}

          {!formMode && (
            <div className="empty-product-form">
              <h2>Selecciona un producto</h2>
              <p>Haz clic en una fila para editar o agrega uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
