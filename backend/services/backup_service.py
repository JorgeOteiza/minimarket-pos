from datetime import datetime
from pathlib import Path
import shutil

from backend.config import Config
from backend.extensions import db


MAX_BACKUPS = 30
BACKUP_PREFIX = "minimarket_backup_"
BACKUP_SUFFIX = ".db"


def _get_sqlite_db_path():
    database_uri = Config.SQLALCHEMY_DATABASE_URI

    if not database_uri.startswith("sqlite:///"):
        raise RuntimeError(
            "Los respaldos automáticos solo están disponibles cuando se usa SQLite."
        )

    db_path = database_uri.replace("sqlite:///", "", 1)

    return Path(db_path).resolve()


def _get_backups_dir():
    backend_dir = Path(__file__).resolve().parents[1]
    backups_dir = backend_dir / "backups"

    backups_dir.mkdir(exist_ok=True)

    return backups_dir


def _validate_backup_filename(filename):
    if not filename:
        raise ValueError("Nombre de respaldo inválido.")

    if "/" in filename or "\\" in filename:
        raise ValueError("Nombre de respaldo inválido.")

    if not filename.startswith(BACKUP_PREFIX) or not filename.endswith(BACKUP_SUFFIX):
        raise ValueError("El archivo seleccionado no corresponde a un respaldo válido.")

    return filename


def _backup_to_dict(file_path):
    return {
        "filename": file_path.name,
        "path": str(file_path),
        "size_bytes": file_path.stat().st_size,
        "created_at": datetime.fromtimestamp(
            file_path.stat().st_mtime
        ).isoformat(timespec="seconds"),
    }


def _cleanup_old_backups():
    backups_dir = _get_backups_dir()

    backup_files = sorted(
        backups_dir.glob(f"{BACKUP_PREFIX}*{BACKUP_SUFFIX}"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    for file_path in backup_files[MAX_BACKUPS:]:
        file_path.unlink()


def create_backup():
    db_path = _get_sqlite_db_path()

    if not db_path.exists():
        raise FileNotFoundError("No se encontró la base de datos SQLite.")

    backups_dir = _get_backups_dir()

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"{BACKUP_PREFIX}{timestamp}{BACKUP_SUFFIX}"
    backup_path = backups_dir / backup_name

    shutil.copy2(db_path, backup_path)

    _cleanup_old_backups()

    return _backup_to_dict(backup_path)


def list_backups():
    backups_dir = _get_backups_dir()

    return [
        _backup_to_dict(file_path)
        for file_path in sorted(
            backups_dir.glob(f"{BACKUP_PREFIX}*{BACKUP_SUFFIX}"),
            key=lambda path: path.stat().st_mtime,
            reverse=True,
        )
    ]


def get_backup_file_path(filename):
    filename = _validate_backup_filename(filename)

    backups_dir = _get_backups_dir()
    backup_path = backups_dir / filename

    if not backup_path.exists():
        raise FileNotFoundError("El respaldo seleccionado no existe.")

    return backup_path


def delete_backup(filename):
    filename = _validate_backup_filename(filename)

    backups_dir = _get_backups_dir()
    backup_path = backups_dir / filename

    if not backup_path.exists():
        raise FileNotFoundError("El respaldo seleccionado no existe.")

    backup_path.unlink()

    return {
        "message": "Respaldo eliminado correctamente.",
        "filename": filename,
    }


def restore_backup(filename):
    filename = _validate_backup_filename(filename)

    db_path = _get_sqlite_db_path()
    backups_dir = _get_backups_dir()
    backup_path = backups_dir / filename

    if not backup_path.exists():
        raise FileNotFoundError("El respaldo seleccionado no existe.")

    if not db_path.exists():
        raise FileNotFoundError("No se encontró la base de datos actual.")

    safety_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    safety_backup_name = f"{BACKUP_PREFIX}pre_restore_{safety_timestamp}{BACKUP_SUFFIX}"
    safety_backup_path = backups_dir / safety_backup_name

    shutil.copy2(db_path, safety_backup_path)

    db.session.remove()
    db.engine.dispose()

    shutil.copy2(backup_path, db_path)

    _cleanup_old_backups()

    return {
        "message": "Respaldo restaurado correctamente. Recarga la aplicación para ver los cambios.",
        "restored_from": filename,
        "safety_backup": safety_backup_name,
    }