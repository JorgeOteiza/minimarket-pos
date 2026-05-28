import type { Cart } from "../types/cart";

const API_URL = "/api";

type CheckoutResponse = {
  sale_id: number;
  total: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Unexpected error";

    try {
      const error = await res.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      errorMessage = "Unexpected error";
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Network error: backend not reachable");
  }
}

export async function getCart(): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart`);
  return handleResponse<Cart>(res);
}

export async function scanProduct(barcode: string): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/scan/${barcode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return handleResponse<Cart>(res);
}

export async function increaseCartItem(productId: number): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity: 1 }),
  });

  return handleResponse<Cart>(res);
}

export async function decreaseCartItem(productId: number): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/decrease`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity: 1 }),
  });

  return handleResponse<Cart>(res);
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/${productId}`, {
    method: "DELETE",
  });

  return handleResponse<Cart>(res);
}

export async function checkout(): Promise<CheckoutResponse> {
  const res = await safeFetch(`${API_URL}/cart/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return handleResponse<CheckoutResponse>(res);
}

export async function clearCart(): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return handleResponse<Cart>(res);
}
