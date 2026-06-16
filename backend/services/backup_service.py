from datetime import datetime
from pathlib import Path
import shutil

from backend.config import Config
from backend.extensions import db


MAX_BACKUPS = 30
BACKUP_PREFIX = "minimarket_backup_"
AUTO_BACKUP_PREFIX = "minimarket_backup_auto_"
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


def _get_created_at_from_filename(file_path):
    filename = file_path.name

    clean_name = filename.replace(BACKUP_PREFIX, "").replace(BACKUP_SUFFIX, "")

    if clean_name.startswith("pre_restore_"):
        clean_name = clean_name.replace("pre_restore_", "", 1)

    if clean_name.startswith("auto_"):
        clean_name = clean_name.replace("auto_", "", 1)

    try:
        created_at = datetime.strptime(clean_name, "%Y-%m-%d_%H-%M-%S")
        return created_at.isoformat(timespec="seconds")
    except ValueError:
        return datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(
            timespec="seconds"
        )


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
        "created_at": _get_created_at_from_filename(file_path),
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


def _copy_database_to_backup(backup_name):
    db_path = _get_sqlite_db_path()

    if not db_path.exists():
        raise FileNotFoundError("No se encontró la base de datos SQLite.")

    backups_dir = _get_backups_dir()
    backup_path = backups_dir / backup_name

    shutil.copy2(db_path, backup_path)

    _cleanup_old_backups()

    return _backup_to_dict(backup_path)


def create_backup():
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"{BACKUP_PREFIX}{timestamp}{BACKUP_SUFFIX}"

    return _copy_database_to_backup(backup_name)


def create_daily_auto_backup():
    today_prefix = datetime.now().strftime("%Y-%m-%d")
    backups_dir = _get_backups_dir()

    existing_auto_backup = sorted(
        backups_dir.glob(f"{AUTO_BACKUP_PREFIX}{today_prefix}_*{BACKUP_SUFFIX}"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    if existing_auto_backup:
        return {
            "created": False,
            "message": "Ya existe un respaldo automático para hoy.",
            "backup": _backup_to_dict(existing_auto_backup[0]),
        }

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_name = f"{AUTO_BACKUP_PREFIX}{timestamp}{BACKUP_SUFFIX}"
    backup = _copy_database_to_backup(backup_name)

    return {
        "created": True,
        "message": "Respaldo automático diario creado correctamente.",
        "backup": backup,
    }


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