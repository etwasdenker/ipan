# backend/app/routers/articles.py
from fastapi import APIRouter, Request, Query, HTTPException
from typing import Optional, Any, List
import os
import re
from pathlib import Path
import asyncpg

router = APIRouter()

# детектор "число или слаг"
_int_re = re.compile(r"^\d+$")

# --- надёжная одноразовая загрузка .env ---
_env_loaded = False

def _load_env_once() -> None:
    """
    Ищет .env вверх по дереву и подгружает DATABASE_URL.
    Работает и без python-dotenv (есть ручной фолбэк).
    Учитывает BOM и пробелы вокруг '='.
    """
    global _env_loaded
    if _env_loaded:
        return
    if os.getenv("DATABASE_URL"):
        _env_loaded = True
        return

    # попытка использовать python-dotenv (необязательно)
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
                # dotenv сам понимает BOM и т.п.
                load_dotenv(env_path, override=False)
            else:
                # ручной парсинг с учётом BOM
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
# -------------------------------------------

async def _get_pool(app) -> asyncpg.Pool:
    pool = getattr(app.state, "pool", None)
    if pool is None:
        _load_env_once()
        dsn = os.getenv("DATABASE_URL")
        if not dsn:
            raise RuntimeError("DATABASE_URL is empty")
        app.state.pool = await asyncpg.create_pool(dsn, min_size=1, max_size=5)
        pool = app.state.pool
    return pool

@router.get("", summary="Список статей (активные и опубликованные)")
async def list_articles(
    request: Request,
    q: Optional[str] = Query(None, description="поиск по полнотекстовому индексу"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    pool = await _get_pool(request.app)

    where: List[str] = ["a.is_active = true", "a.status = 'published'"]
    params: List[Any] = []
    if q:
        where.append("a.search @@ plainto_tsquery('russian', $1)")
        params.append(q)

    sql = f"""
    SELECT
      a.id, a.slug, a.title, a.teaser, a.brief,
      a.published_at, a.author_id,
      md.href AS hero_desktop_href,
      mm.href AS hero_mobile_href,
      th.href AS thumb_href,
      COALESCE((
        SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
        FROM public.article_tags at
        JOIN public.tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id
      ), '[]'::json) AS tags
    FROM public.articles a
    LEFT JOIN public.media md ON md.id = a.hero_desktop_media_id
    LEFT JOIN public.media mm ON mm.id = a.hero_mobile_media_id
    LEFT JOIN public.media th ON th.id = a.thumb_media_id
    WHERE {" AND ".join(where)}
    ORDER BY a.published_at DESC NULLS LAST, a.id DESC
    LIMIT {limit} OFFSET {offset};
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)

    return [dict(r) for r in rows]

@router.get("/{id_or_slug}", summary="Одна статья по id или slug")
async def get_article(request: Request, id_or_slug: str):
    pool = await _get_pool(request.app)

    if _int_re.match(id_or_slug or ""):
        cond = "a.id = $1"
        param: Any = int(id_or_slug)
    else:
        cond = "a.slug = $1"
        param = id_or_slug

    sql = f"""
    SELECT
      a.*,
      md.href AS hero_desktop_href,
      mm.href AS hero_mobile_href,
      th.href AS thumb_href,
      COALESCE((
        SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'color', t.color))
        FROM public.article_tags at
        JOIN public.tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id
      ), '[]'::json) AS tags,
      COALESCE((
        SELECT json_agg(json_build_object(
          'id', c.id,
          'author_id', c.author_id,
          'content', c.content,
          'created_at', c.created_at
        ) ORDER BY c.created_at ASC)
        FROM public.article_comments ac
        JOIN public.comments c ON c.id = ac.comment_id
        WHERE ac.article_id = a.id
      ), '[]'::json) AS comments
    FROM public.articles a
    LEFT JOIN public.media md ON md.id = a.hero_desktop_media_id
    LEFT JOIN public.media mm ON mm.id = a.hero_mobile_media_id
    LEFT JOIN public.media th ON th.id = a.thumb_media_id
    WHERE {cond}
    LIMIT 1;
    """

    async with pool.acquire() as conn:
        row = await conn.fetchrow(sql, param)

    if not row:
        raise HTTPException(status_code=404, detail="article not found")

    return dict(row)
