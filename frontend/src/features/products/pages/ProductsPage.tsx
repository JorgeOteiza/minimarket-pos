import { useEffect, useState } from "react";
import { ProductList } from "../components/ProductList";
import { ProductForm } from "../components/ProductForm";
import { getProducts } from "../services/productApi";
import type { Product } from "../types/product";

type FormMode = "create" | "edit" | null;

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProducts({
          query,
          page,
          perPage,
        });

        if (controller.signal.aborted) return;

        setProducts(data.items);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(loadProducts, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, page, perPage]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormMode("create");
    setIsFormPanelOpen(true);
  };

  const handleProductCreated = (created: Product) => {
    setProducts((prev) => [created, ...prev]);
    setSelectedProduct(created);
    setFormMode("edit");
    setIsFormPanelOpen(true);
    setTotalProducts((prev) => prev + 1);
  };

  const handleProductUpdated = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct(updated);
    setFormMode("edit");
  };

  const handleProductDeleted = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSelectedProduct(null);
    setFormMode(null);
    setIsFormPanelOpen(false);
    setTotalProducts((prev) => Math.max(0, prev - 1));
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedProduct(null);
    setIsFormPanelOpen(false);
  };

  const toggleFormPanel = () => {
    setIsFormPanelOpen((prev) => !prev);
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
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        className="products-search"
      />

      {error && <div className="error">{error}</div>}

      <div
        className={`products-layout ${
          isFormPanelOpen ? "with-form-panel" : "without-form-panel"
        }`}
      >
        <div className="products-list-panel">
          <ProductList
            products={products}
            loading={loading}
            selectedProductId={selectedProduct?.id ?? null}
            onSelectProduct={handleSelectProduct}
            onProductUpdated={handleProductUpdated}
          />

          <div className="products-pagination">
            <span>
              Mostrando página {page} de {totalPages} · {totalProducts}{" "}
              productos
            </span>

            <div className="pagination-controls">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>

              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="product-sidebar-toggle"
          onClick={toggleFormPanel}
          title={isFormPanelOpen ? "Ocultar panel" : "Mostrar panel"}
        >
          {isFormPanelOpen ? "›" : "‹"}
        </button>

        {isFormPanelOpen && (
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
                onDeleted={handleProductDeleted}
                onCancel={handleCancelForm}
              />
            )}

            {!formMode && (
              <div className="empty-product-form">
                <h2>Panel de producto</h2>
                <p>Selecciona un producto o agrega uno nuevo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
