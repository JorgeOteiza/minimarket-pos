import type { Cart } from "../types/cart";

const API_URL = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Unexpected error";

    try {
      const error = await res.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // Ignore JSON parse errors and use default error message
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

export async function scanProduct(barcode: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart/scan/${barcode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<Cart>(res);
}

export async function getCart(): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart`);
  return handleResponse<Cart>(res);
}

export async function checkout(): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // 👈 importante para evitar 422
  });

  return handleResponse<Cart>(res);
}

export async function clearCart(): Promise<Cart> {
  const res = await fetch(`${API_URL}/cart/clear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  return handleResponse<Cart>(res);
}
