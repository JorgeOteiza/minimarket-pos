import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createBackup,
  deleteBackup,
  getBackupDownloadUrl,
  getBackups,
  restoreBackup,
  type BackupFile,
} from "../services/backupApi";

import ConfirmDialog from "../../../components/ui/ConfirmDialog";

import "../styles/backups.css";

const MAX_BACKUPS = 30;

type BackupConfirmAction =
  | {
      type: "restore";
      filename: string;
    }
  | {
      type: "delete";
      filename: string;
    }
  | null;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState<string | null>(
    null,
  );
  const [deletingFilename, setDeletingFilename] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<BackupConfirmAction>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalBackupSize = useMemo(
    () => backups.reduce((sum, backup) => sum + backup.size_bytes, 0),
    [backups],
  );

  const loadBackups = useCallback(async () => {
    const data = await getBackups();
    setBackups(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBackups();

        if (!isMounted) return;

        setBackups(data);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError("");
      setMessage("");

      const result = await createBackup();

      setMessage(result.message);
      await loadBackups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    try {
      setRestoringFilename(filename);
      setError("");
      setMessage("");

      const result = await restoreBackup(filename);

      setMessage(`${result.message} Respaldo previo: ${result.safety_backup}`);
      await loadBackups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setRestoringFilename(null);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      setDeletingFilename(filename);
      setError("");
      setMessage("");

      const result = await deleteBackup(filename);

      setMessage(result.message);
      await loadBackups();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setDeletingFilename(null);
    }
  };

  const handleConfirmBackupAction = async () => {
    if (!confirmAction) return;

    const currentAction = confirmAction;

    if (currentAction.type === "restore") {
      await handleRestoreBackup(currentAction.filename);
    }

    if (currentAction.type === "delete") {
      await handleDeleteBackup(currentAction.filename);
    }

    setConfirmAction(null);
  };

  const confirmTitle =
    confirmAction?.type === "restore"
      ? "Restaurar respaldo"
      : "Eliminar respaldo";

  const confirmDescription =
    confirmAction?.type === "restore"
      ? "Se reemplazará la base de datos actual por la copia seleccionada. Antes de restaurar, el sistema creará automáticamente un respaldo de seguridad del estado actual."
      : "Esta acción solo elimina el archivo de respaldo seleccionado. No elimina productos, ventas ni datos actuales de la aplicación.";

  const confirmLabel =
    confirmAction?.type === "restore" ? "Restaurar respaldo" : "Eliminar";

  const confirmLoading =
    confirmAction?.type === "restore"
      ? restoringFilename !== null
      : deletingFilename !== null;

  return (
    <div className="backups-page">
      <div className="backups-header">
        <div>
          <h1>Respaldos</h1>
          <p>Crea, restaura y administra copias de seguridad locales.</p>
        </div>

        <button
          type="button"
          className="backup-create-button"
          onClick={handleCreateBackup}
          disabled={creating || restoringFilename !== null}
        >
          {creating ? "Creando..." : "Crear respaldo"}
        </button>
      </div>

      <div className="backup-info-card">
        <strong>Importante</strong>
        <p>
          Restaurar un respaldo reemplaza la base de datos actual. El sistema
          crea automáticamente una copia de seguridad antes de restaurar.
        </p>
      </div>

      <div className="backup-summary-grid">
        <div className="backup-summary-card">
          <span>Respaldos guardados</span>
          <strong>{backups.length}</strong>
          <small>Máximo automático: {MAX_BACKUPS}</small>
        </div>

        <div className="backup-summary-card">
          <span>Espacio utilizado</span>
          <strong>{formatBytes(totalBackupSize)}</strong>
          <small>Espacio ocupado por copias locales</small>
        </div>

        <div className="backup-summary-card">
          <span>Estado</span>
          <strong>
            {backups.length >= MAX_BACKUPS ? "Límite activo" : "OK"}
          </strong>
          <small>
            {backups.length >= MAX_BACKUPS
              ? "Se eliminarán respaldos antiguos automáticamente"
              : "Aún hay margen para más respaldos"}
          </small>
        </div>
      </div>

      {message && <div className="backup-success">{message}</div>}

      {error && <div className="backup-error">{error}</div>}

      <section className="backup-card">
        <h2>Respaldos creados ({backups.length})</h2>

        {loading ? (
          <p>Cargando respaldos...</p>
        ) : backups.length === 0 ? (
          <p>No hay respaldos creados todavía.</p>
        ) : (
          <div className="backup-table-wrapper">
            <table className="backup-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Archivo</th>
                  <th>Tamaño</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {backups.map((backup) => {
                  const isRestoring = restoringFilename === backup.filename;
                  const isDeleting = deletingFilename === backup.filename;

                  return (
                    <tr key={backup.filename}>
                      <td>{formatDate(backup.created_at)}</td>
                      <td>{backup.filename}</td>
                      <td>{formatBytes(backup.size_bytes)}</td>
                      <td>
                        <div className="backup-actions">
                          <button
                            type="button"
                            className="backup-restore-button"
                            onClick={() =>
                              setConfirmAction({
                                type: "restore",
                                filename: backup.filename,
                              })
                            }
                            disabled={
                              isRestoring ||
                              isDeleting ||
                              creating ||
                              restoringFilename !== null
                            }
                          >
                            {isRestoring ? "Restaurando..." : "Restaurar"}
                          </button>

                          <a
                            className="backup-download-button"
                            href={getBackupDownloadUrl(backup.filename)}
                            download
                          >
                            Descargar
                          </a>

                          <button
                            type="button"
                            className="backup-delete-button"
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                filename: backup.filename,
                              })
                            }
                            disabled={isRestoring || isDeleting || creating}
                          >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        cancelLabel="Cancelar"
        variant={confirmAction?.type === "delete" ? "danger" : "warning"}
        loading={confirmLoading}
        onConfirm={handleConfirmBackupAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
