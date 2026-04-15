import type { Product } from "../types/product";

const API_URL = "http://localhost:5000/api";

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query) return [];

  const res = await fetch(`${API_URL}/products/search?q=${query}`);

  if (!res.ok) {
    throw new Error("Error fetching products");
  }

  return res.json();
};
