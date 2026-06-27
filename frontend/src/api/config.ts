const DEFAULT_API_URL = "http://localhost:5000/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL;

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
