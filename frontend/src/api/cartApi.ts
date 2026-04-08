import type { Cart } from "../types/cart";

const API_URL = "/api";

// 🔹 Tipos para respuestas del backend
type CheckoutResponse = {
  message: string;
  sale_id: number;
  total: number;
};

type ClearCartResponse = {
  message: string;
  cart: Cart;
};

// 🔹 Helper centralizado (nivel pro)
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Unexpected error";

    try {
      const error = await res.json();
      errorMessage = error.error || error.message || errorMessage;
    } catch {
      // fallback si no viene JSON
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

// 🔹 Wrapper seguro para fetch (maneja errores de red)
async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Network error: backend not reachable");
  }
}

// 🔹 Escanear producto
export async function scanProduct(barcode: string): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart/scan/${barcode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<Cart>(res);
}

// 🔹 Obtener carrito
export async function getCart(): Promise<Cart> {
  const res = await safeFetch(`${API_URL}/cart`);
  return handleResponse<Cart>(res);
}

// 🔹 Checkout
export async function checkout(): Promise<CheckoutResponse> {
  const res = await safeFetch(`${API_URL}/cart/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // evita 422 en Flask
  });

  return handleResponse<CheckoutResponse>(res);
}

// 🔹 Vaciar carrito
export async function clearCart(): Promise<ClearCartResponse> {
  const res = await safeFetch(`${API_URL}/cart/clear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  return handleResponse<ClearCartResponse>(res);
}
