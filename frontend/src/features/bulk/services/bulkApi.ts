const API_URL = "/api";

export type BulkProduct = {
  id: number;
  name: string;
  barcode: string | null;
  package_quantity: number;
  unit: string;
  cost: number | null;
  sale_margin: number;
  active: boolean;
  created_at: string;
};

export type BulkRestock = {
  id: number;
  bulk_product_id: number;
  product_name: string;
  barcode: string | null;
  quantity_packages: number;
  package_quantity: number;
  unit: string;
  unit_cost: number | null;
  total_cost: number | null;
  note: string | null;
  created_at: string;
};

export type BulkProductDTO = {
  name: string;
  barcode: string;
  package_quantity: number;
  unit: string;
  cost?: number | "";
  sale_margin: number;
};

export type CreateBulkRestockDTO = {
  bulk_product_id?: number;
  barcode?: string;
  quantity_packages: number;
  note?: string;
};

export type DeleteBulkProductResponse = {
  message: string;
  id: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Error inesperado");
  }

  return res.json();
}

export async function getBulkProducts(): Promise<BulkProduct[]> {
  const res = await fetch(`${API_URL}/bulk-products`);

  return handleResponse<BulkProduct[]>(res);
}

export async function createBulkProduct(
  data: BulkProductDTO,
): Promise<BulkProduct> {
  const res = await fetch(`${API_URL}/bulk-products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<BulkProduct>(res);
}

export async function updateBulkProduct(
  id: number,
  data: BulkProductDTO,
): Promise<BulkProduct> {
  const res = await fetch(`${API_URL}/bulk-products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<BulkProduct>(res);
}

export async function deleteBulkProduct(
  id: number,
): Promise<DeleteBulkProductResponse> {
  const res = await fetch(`${API_URL}/bulk-products/${id}`, {
    method: "DELETE",
  });

  return handleResponse<DeleteBulkProductResponse>(res);
}

export async function getBulkRestocks(): Promise<BulkRestock[]> {
  const res = await fetch(`${API_URL}/bulk-restocks?limit=100`);

  return handleResponse<BulkRestock[]>(res);
}

export async function createBulkRestock(
  data: CreateBulkRestockDTO,
): Promise<BulkRestock> {
  const res = await fetch(`${API_URL}/bulk-restocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<BulkRestock>(res);
}
