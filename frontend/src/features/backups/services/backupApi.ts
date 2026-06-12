const API_URL = "http://localhost:5000/api";

export type BackupFile = {
  filename: string;
  path: string;
  size_bytes: number;
  created_at: string;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Error inesperado");
  }

  return res.json();
}

export async function getBackups(): Promise<BackupFile[]> {
  const res = await fetch(`${API_URL}/backups`);

  return handleResponse<BackupFile[]>(res);
}

export async function createBackup(): Promise<{
  message: string;
  backup: BackupFile;
}> {
  const res = await fetch(`${API_URL}/backups/create`, {
    method: "POST",
  });

  return handleResponse<{
    message: string;
    backup: BackupFile;
  }>(res);
}

export async function restoreBackup(filename: string): Promise<{
  message: string;
  restored_from: string;
  safety_backup: string;
}> {
  const res = await fetch(
    `${API_URL}/backups/${encodeURIComponent(filename)}/restore`,
    {
      method: "POST",
    },
  );

  return handleResponse<{
    message: string;
    restored_from: string;
    safety_backup: string;
  }>(res);
}

export async function deleteBackup(filename: string): Promise<{
  message: string;
  filename: string;
}> {
  const res = await fetch(
    `${API_URL}/backups/${encodeURIComponent(filename)}`,
    {
      method: "DELETE",
    },
  );

  return handleResponse<{
    message: string;
    filename: string;
  }>(res);
}

export function getBackupDownloadUrl(filename: string) {
  return `${API_URL}/backups/${encodeURIComponent(filename)}/download`;
}
