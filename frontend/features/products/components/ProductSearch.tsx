import { useEffect, useState, useCallback } from "react";
import { searchProducts } from "../services/productApi";
import { useDebounce } from "../hooks/useDebounce";
import type { Product } from "../types/product";

interface Props {
  onSelectProduct?: (product: Product) => void;
}

export const ProductSearch = ({ onSelectProduct }: Props) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // 🔄 fetch memoizado
  const fetchProducts = useCallback(async () => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const data = await searchProducts(debouncedQuery);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ⌨️ navegación teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(results[activeIndex]);
    }
  };

  const handleSelect = (product: Product) => {
    setQuery("");
    setResults([]);
    setActiveIndex(-1);

    onSelectProduct?.(product);
  };

  return (
    <div style={{ width: "400px", position: "relative" }}>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: "100%", padding: "8px" }}
      />

      {loading && <div>Cargando...</div>}

      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "40px",
            width: "100%",
            border: "1px solid #ccc",
            background: "#fff",
            listStyle: "none",
            padding: 0,
            margin: 0,
            zIndex: 10,
          }}
        >
          {results.map((product, index) => (
            <li
              key={product.id}
              onClick={() => handleSelect(product)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: index === activeIndex ? "#eee" : "#fff",
              }}
            >
              <strong>{product.name}</strong>
              <div style={{ fontSize: "12px" }}>
                ${product.price} | Stock: {product.stock}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
