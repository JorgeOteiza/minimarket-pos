import type {
  Product,
  UpdateProductDTO,
  CreateProductDTO,
} from "../types/product";

const API_URL = "http://localhost:5000/api";

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query) return [];

  const res = await fetch(`${API_URL}/products/search?name=${query}`);

  if (!res.ok) {
    throw new Error("Error fetching products");
  }

  return res.json();
};

export const createProduct = async (
  data: CreateProductDTO,
): Promise<Product> => {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || error.error || "Error creating product");
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
    throw new Error(error.message || error.error || "Error updating product");
  }

  return res.json();
};
