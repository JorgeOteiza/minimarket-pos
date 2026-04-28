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
    } catch {}

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

export async function scanProduct(barcode: string): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/scan/${barcode}`, {
    method: "POST",
  });

  return handleResponse<Cart>(res);
}

export async function getCart(): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart`);
  return handleResponse<Cart>(res);
}

export async function checkout(): Promise<CheckoutResponse> {
  const res = await safeFetch(`${API_URL}/cart/checkout`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  return handleResponse<CheckoutResponse>(res);
}

export async function clearCart(): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/clear`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  return handleResponse<Cart>(res);
}