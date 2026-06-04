import { useEffect, useState } from "react";

import { ProductList } from "../components/ProductList";
import { ProductForm } from "../components/ProductForm";
import InventoryAdjustmentForm from "../components/InventoryAdjustmentForm";
import InventoryMovementsList from "../components/InventoryMovementsList";

import { getProducts } from "../services/productApi";
import type { Product } from "../types/product";

type PanelMode = "create" | "edit" | "inventory" | null;

type SortMode = "name_asc" | "name_desc" | "price_asc" | "price_desc";

const PRODUCTS_SORT_STORAGE_KEY = "products_sort_mode";
const PRODUCTS_PER_PAGE_STORAGE_KEY = "products_per_page";

const getInitialSortMode = (): SortMode => {
  const saved = localStorage.getItem(PRODUCTS_SORT_STORAGE_KEY);

  if (
    saved === "name_asc" ||
    saved === "name_desc" ||
    saved === "price_asc" ||
    saved === "price_desc"
  ) {
    return saved;
  }

  return "name_asc";
};

const getInitialPerPage = () => {
  const saved = Number(localStorage.getItem(PRODUCTS_PER_PAGE_STORAGE_KEY));

  return [50, 100, 200, 300].includes(saved) ? saved : 100;
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<
    number | null
  >(null);

  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>(getInitialSortMode);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(getInitialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [inventoryHistoryRefreshKey, setInventoryHistoryRefreshKey] =
    useState(0);

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
          sort: sortMode,
        });

        if (controller.signal.aborted) return;

        setProducts(data.items);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Error desconocido");
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
  }, [query, page, perPage, sortMode]);

  const handleHighlightProduct = (product: Product) => {
    setHighlightedProductId(product.id);
  };

  const handleSelectProduct = (product: Product) => {
    const formElement = document.querySelector(".product-form");
    const isDirty = formElement?.getAttribute("data-dirty") === "true";

    if (isDirty) {
      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Cambiar de producto igualmente?",
      );

      if (!confirmed) return;
    }

    setHighlightedProductId(product.id);
    setSelectedProduct(product);
    setPanelMode("edit");
    setIsFormPanelOpen(true);
  };

  const handleInventoryAdjust = (product: Product) => {
    setHighlightedProductId(product.id);
    setSelectedProduct(product);
    setPanelMode("inventory");
    setIsFormPanelOpen(true);
  };

  const handleAddProduct = () => {
    setHighlightedProductId(null);
    setSelectedProduct(null);
    setPanelMode("create");
    setIsFormPanelOpen(true);
  };

  const handleProductCreated = (created: Product) => {
    setProducts((prev) => [created, ...prev]);
    setTotalProducts((prev) => prev + 1);
    setHighlightedProductId(created.id);
    setSelectedProduct(null);
    setPanelMode("create");
    setIsFormPanelOpen(true);
  };

  const handleProductUpdated = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setHighlightedProductId(updated.id);
    setSelectedProduct(updated);
    setPanelMode("edit");
    setIsFormPanelOpen(true);
  };

  const handleProductDeleted = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setSelectedProduct(null);
    setHighlightedProductId(null);
    setPanelMode(null);
    setIsFormPanelOpen(false);
    setTotalProducts((prev) => Math.max(0, prev - 1));
  };

  const handleCancelForm = () => {
    setPanelMode(null);
    setSelectedProduct(null);
    setIsFormPanelOpen(false);
  };

  const toggleFormPanel = () => {
    setIsFormPanelOpen((prev) => !prev);
  };

  const handlePerPageChange = (value: number) => {
    localStorage.setItem(PRODUCTS_PER_PAGE_STORAGE_KEY, String(value));
    setPerPage(value);
    setPage(1);
  };

  const handleSortChange = (value: SortMode) => {
    localStorage.setItem(PRODUCTS_SORT_STORAGE_KEY, value);
    setSortMode(value);
    setPage(1);
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

      <div className="products-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="products-search"
        />

        <div className="products-toolbar-controls">
          <label>
            Ordenar
            <select
              value={sortMode}
              onChange={(e) => handleSortChange(e.target.value as SortMode)}
            >
              <option value="name_asc">Nombre A-Z</option>
              <option value="name_desc">Nombre Z-A</option>
              <option value="price_desc">Precio mayor a menor</option>
              <option value="price_asc">Precio menor a mayor</option>
            </select>
          </label>

          <label>
            Mostrar
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={300}>300</option>
            </select>
          </label>
        </div>
      </div>

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
            selectedProductId={highlightedProductId}
            onHighlightProduct={handleHighlightProduct}
            onSelectProduct={handleSelectProduct}
            onAdjustInventory={handleInventoryAdjust}
          />

          <div className="products-pagination">
            <span>
              Mostrando página {page} de {totalPages} · {totalProducts}{" "}
              productos
            </span>

            <div className="pagination-controls">
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
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
          <div
            key={`${panelMode}-${selectedProduct?.id ?? "new"}`}
            className="products-form-panel product-panel-flash"
          >
            {panelMode === "create" && (
              <ProductForm
                mode="create"
                onCreated={handleProductCreated}
                onCancel={handleCancelForm}
              />
            )}

            {panelMode === "edit" && selectedProduct && (
              <ProductForm
                key={selectedProduct.id}
                mode="edit"
                product={selectedProduct}
                onUpdated={handleProductUpdated}
                onDeleted={handleProductDeleted}
                onCancel={handleCancelForm}
              />
            )}

            {panelMode === "inventory" && selectedProduct && (
              <InventoryAdjustmentForm
                product={selectedProduct}
                onClose={handleCancelForm}
                onSuccess={async () => {
                  const data = await getProducts({
                    query,
                    page,
                    perPage,
                    sort: sortMode,
                  });

                  setProducts(data.items);
                  setInventoryHistoryRefreshKey((prev) => prev + 1);
                }}
              />
            )}

            {!panelMode && (
              <div className="empty-product-form">
                <h2>Panel de producto</h2>
                <p>Selecciona un producto o agrega uno nuevo.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <InventoryMovementsList refreshKey={inventoryHistoryRefreshKey} />
    </div>
  );
};

export default ProductsPage;
