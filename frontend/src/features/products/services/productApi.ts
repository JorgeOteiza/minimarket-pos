import type {
  Product,
  UpdateProductDTO,
  CreateProductDTO,
} from "../types/product";

const API_URL = "http://localhost:5000/api";

const parseErrorResponse = async (res: Response, fallbackMessage: string) => {
  const error = await res.json().catch(() => null);

  let message = error?.message || error?.error || fallbackMessage;

  // 🔥 errores de validación marshmallow
  if (error?.details) {
    const firstField = Object.keys(error.details)[0];

    if (firstField) {
      const fieldErrors = error.details[firstField];

      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const rawMessage = fieldErrors[0];

        const fieldLabels: Record<string, string> = {
          name: "nombre",
          barcode: "código de barras",
          cost: "costo caja",
          pack_units: "unidades por caja",
          stock: "stock disponible",
          price: "precio venta",
          min_stock: "stock mínimo",
        };

        const label = fieldLabels[firstField] ?? firstField;

        if (rawMessage.includes("Field may not be null")) {
          message = `Debes ingresar ${label}`;
        } else if (rawMessage.includes("Shorter than minimum length")) {
          message = `El campo ${label} es obligatorio`;
        } else if (rawMessage.includes("Must be greater than or equal to 0")) {
          message = `El campo ${label} debe ser mayor o igual a 0`;
        } else {
          message = rawMessage;
        }
      }
    }
  }

  throw new Error(message);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (!query) return [];

  const res = await fetch(
    `${API_URL}/products/search?q=${encodeURIComponent(query)}`,
  );

  if (!res.ok) {
    await parseErrorResponse(res, "Error buscando productos");
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
    await parseErrorResponse(res, "Error creando producto");
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
    await parseErrorResponse(res, "Error actualizando producto");
  }

  return res.json();
};

export const deleteProduct = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    await parseErrorResponse(res, "Error eliminando producto");
  }
};

export type PaginatedProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

type GetProductsParams = {
  query?: string;
  page?: number;
  perPage?: number;
};

export const getProducts = async ({
  query = "",
  page = 1,
  perPage = 100,
}: GetProductsParams): Promise<PaginatedProductsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const endpoint = query.trim()
    ? `${API_URL}/products/search?q=${encodeURIComponent(query)}&${params}`
    : `${API_URL}/products?${params}`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    await parseErrorResponse(res, "Error obteniendo productos");
  }

  return res.json();
};
