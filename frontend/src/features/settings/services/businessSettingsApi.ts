const API_URL = "http://localhost:5000/api";

export type BusinessSettings = {
  id: number;
  business_name: string;
  rut: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  footer_message: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UpdateBusinessSettingsDTO = {
  business_name: string;
  rut: string;
  address: string;
  phone: string;
  email: string;
  footer_message: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Error inesperado");
  }

  return res.json();
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const res = await fetch(`${API_URL}/business-settings`);

  return handleResponse<BusinessSettings>(res);
}

export async function updateBusinessSettings(
  data: UpdateBusinessSettingsDTO,
): Promise<BusinessSettings> {
  const res = await fetch(`${API_URL}/business-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<BusinessSettings>(res);
}
