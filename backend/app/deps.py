# backend/app/deps.py
import os
import re
from pathlib import Path
import asyncpg

# одноразовая подгрузка .env (учитываем BOM и пробелы вокруг '=')
_env_loaded = False

def _load_env_once() -> None:
    global _env_loaded
    if _env_loaded:
        return
    if os.getenv("DATABASE_URL"):
        _env_loaded = True
        return

    try:
        from dotenv import load_dotenv  # type: ignore
    except Exception:
        load_dotenv = None  # type: ignore

    pat = re.compile(r'^DATABASE_URL\s*=\s*(.+)$')
    base = Path(__file__).resolve()
    for parent in [base.parent, *base.parents]:
        env_path = parent / ".env"
        if env_path.exists():
            if load_dotenv:
                load_dotenv(env_path, override=False)
            else:
                try:
                    text = env_path.read_text(encoding="utf-8-sig")
                    for raw in text.splitlines():
                        line = raw.strip()
                        if not line or line.startswith("#"):
                            continue
                        m = pat.match(line)
                        if m:
                            val = m.group(1).strip().strip('"').strip("'")
                            if val and "DATABASE_URL" not in os.environ:
                                os.environ["DATABASE_URL"] = val
                            break
                except Exception:
                    pass
            break

    _env_loaded = True


async def db_ping():
    """
    Healthcheck БД: возвращает ok:true и текущие user/db.
    Если что-то не так — ok:false + текст ошибки (без 500).
    """
    _load_env_once()
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        return {"ok": False, "error": "DATABASE_URL is empty (not found in environment or .env)"}

    conn = None
    try:
        conn = await asyncpg.connect(dsn)
        row = await conn.fetchrow("select current_user as user, current_database() as db;")
        return {"ok": True, "user": row["user"], "db": row["db"]}
    except Exception as e:
        return {"ok": False, "error": str(e)}
    finally:
        if conn:
            try:
                await conn.close()
            except Exception:
                pass
