import { useEffect, useRef, useState } from "react";

import { searchProducts } from "../features/products/services/productApi";

import type { Product } from "../features/products/types/product";

type Props = {
  disabled?: boolean;

  onSelect: (barcodeOrQuery: string) => Promise<void>;
};

export default function ProductSearchInput({
  disabled = false,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // =========================
  // AUTOFOCUS
  // =========================

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // =========================
  // SEARCH
  // =========================

  useEffect(() => {
    const trimmed = query.trim();

    const runSearch = async () => {
      // =========================
      // QUERY MUY CORTA
      // =========================

      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const products = await searchProducts(trimmed);

        setResults(products.slice(0, 8));

        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(runSearch, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // =========================
  // SELECT PRODUCT
  // =========================

  const handleSelect = async (product: Product) => {
    const barcode = product.barcode?.trim();

    if (!barcode) {
      return;
    }

    await onSelect(barcode);

    setQuery("");
    setResults([]);

    inputRef.current?.focus();
  };

  // =========================
  // KEYBOARD NAVIGATION
  // =========================

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // =========================
    // ENTER
    // =========================

    if (e.key === "Enter") {
      e.preventDefault();

      const selected = results[selectedIndex];

      // autocomplete selection
      if (selected) {
        await handleSelect(selected);

        return;
      }

      // direct barcode/manual
      const trimmed = query.trim();

      if (trimmed) {
        await onSelect(trimmed);

        setQuery("");
        setResults([]);
      }
    }

    // =========================
    // DOWN
    // =========================

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    }

    // =========================
    // UP
    // =========================

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    // =========================
    // ESC
    // =========================

    if (e.key === "Escape") {
      setResults([]);
    }
  };

  return (
    <div className="product-search-wrapper">
      <input
        ref={inputRef}
        className="pos-input"
        type="text"
        placeholder="Escanear o buscar producto..."
        value={query}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {loading && <div className="search-loading">Buscando...</div>}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className={`search-result-item ${
                index === selectedIndex ? "active" : ""
              }`}
              onClick={() => handleSelect(product)}
            >
              <div>
                <strong>{product.name}</strong>
              </div>

              <div className="search-result-meta">
                <span>${product.price ?? 0}</span>

                <span>Stock: {product.stock}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
