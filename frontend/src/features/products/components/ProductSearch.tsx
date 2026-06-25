import { useEffect, useState } from "react";

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

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      const cleanQuery = debouncedQuery.trim();

      if (!cleanQuery) {
        setResults([]);
        setActiveIndex(-1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await searchProducts(cleanQuery);

        if (!isMounted) return;

        setResults(data);
        setActiveIndex(data.length > 0 ? 0 : -1);
      } catch (err) {
        if (!isMounted) return;

        console.error(err);
        setResults([]);
        setActiveIndex(-1);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }

    if (e.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
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
