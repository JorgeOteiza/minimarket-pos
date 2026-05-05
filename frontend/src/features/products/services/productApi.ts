import type { Product, UpdateProductDTO } from "../types/product";

const API_URL = "http://localhost:5000/api";

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query) return [];

  const res = await fetch(`${API_URL}/products/search?name=${query}`);

  if (!res.ok) {
    throw new Error("Error fetching products");
  }

  return res.json();
};

export const updateProduct = async (
  id: number,
  data: UpdateProductDTO,
): Promise<Product> => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error updating product");
  }

  return res.json();
};
