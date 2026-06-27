import sqlite3
from pathlib import Path

from backend.services import backup_service


def test_ensure_daily_auto_backup_creates_backup_when_missing(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    backup_dir = tmp_path / "backups"
    backup_dir.mkdir()

    connection = sqlite3.connect(db_path)
    connection.execute("CREATE TABLE sample (id INTEGER PRIMARY KEY)")
    connection.commit()
    connection.close()

    monkeypatch.setattr(
        backup_service.Config,
        "SQLALCHEMY_DATABASE_URI",
        f"sqlite:///{db_path}",
    )
    monkeypatch.setattr(backup_service, "_get_backups_dir", lambda: backup_dir)

    result = backup_service.ensure_daily_auto_backup()

    assert result["created"] is True
    backups = list(backup_dir.glob("minimarket_backup_auto_*.db"))
    assert len(backups) == 1
    assert backups[0].exists()
