# Assistant Context — snapshot (nested, filtered)

## Runtime
- **python**: 3.13.5
- **platform**: win32
- **time_utc**: 2025-11-11T16:23:27.301756Z

## Git
- branch: `refactor/carcass`
- commit: `48966c0482b8a2347f0613355c25f024c78ae799`
- clean: `False`

## Summary
- files: **37**
- embedded text ≈ **61.0 KB**

## Files (inline where small)
### `.gitignore` (533 bytes)
- sha1: `796290cdef93368a7b98bed2944ff7882bbff294`
- type: `text`

```text

.env
.env.*
# build/deps
node_modules/
dist/
build/
.cache/
.next/
.vite/
**/node_modules/.vite/
# Assistant snapshots
_assistant_context/out/
# env
.env
.env.local
# build/deps
node_modules/
dist/
build/
.cache/
.next/
.vite/
**/node_modules/.vite/
# Assistant snapshots
_assistant_context/out/
# env
.env
.env.local

# Node/Vite
frontend/ipan/node_modules/
frontend/ipan/dist/
# Python venv
.venv/
# ENV
.env
.env.*
# OS junk
.DS_Store
Thumbs.db


_assistant_context/
.txt


# ignore loose notes at repo root
/*.txt


```

### `backend/__init__.py` (0 bytes)
- sha1: `da39a3ee5e6b4b0d3255bfef95601890afd80709`
- type: `text`

_(content omitted by policy or size)_

### `backend/app/__init__.py` (0 bytes)
- sha1: `da39a3ee5e6b4b0d3255bfef95601890afd80709`
- type: `text`

_(content omitted by policy or size)_

### `backend/app/deps.py` (2392 bytes)
- sha1: `c4796d61993bcf33ebab61daa2812449ebf990de`
- type: `text`

```text
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

```

### `backend/app/main.py` (924 bytes)
- sha1: `5d56c77c98ef13c5b6a482c57f3a6242bb4bc4a4`
- type: `text`

```text
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Загружаем .env из корня репозитория (C:\.code\.ipan\.env)
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
except Exception:
    pass

from .deps import db_ping
from .routers import articles

app = FastAPI(title="IPAN API", version="0.1.0")

# CORS (пока максимально открыто — позже сузим)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# healthcheck
@app.get("/db/ping")
async def ping():
    return await db_ping()

# API: статьи
app.include_router(articles.router, prefix="/api/articles", tags=["articles"])

```

### `backend/app/routers/__init__.py` (17 bytes)
- sha1: `0025d88a66d28b57e7f6809b321c50540acab120`
- type: `text`

```text
# routers package
```

### `backend/app/routers/articles.py` (5837 bytes)
- sha1: `a1165c119be171284442281023230a56c333b295`
- type: `text`

```text
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

```

### `frontend/ipan/public/brand/account.svg` (18850 bytes)
- sha1: `fb799a595c647cfdf7142ffc152558e1f98afe36`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/base_online.svg` (2847 bytes)
- sha1: `639519a7221f69de2c5d3faaa4692faa15d65bc1`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/folder.svg` (917 bytes)
- sha1: `1fbc865bb5dac047855675953a480a9d2abaee8d`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/left_panel.svg` (1424 bytes)
- sha1: `8c30ce88bf0a3fec1caa31cdcb6439e35189913a`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/logo_ipan.svg` (832 bytes)
- sha1: `0859a4d15ef595f487efd0d2a0635f66fd3be4aa`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/logo_ipan_word.svg` (3210 bytes)
- sha1: `818d21ac6f735a3699f6a68bf4703c1c0383d6ab`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/options.svg` (4551 bytes)
- sha1: `6a0c887449cd880c43d762a53e36d23b3e4e0d2d`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/public/brand/refresh.svg` (2176 bytes)
- sha1: `30a661a95dc57dcd3871bab6c158b4f1069e5a9a`
- type: `binary`

_(content omitted by policy or size)_

### `frontend/ipan/src/App.tsx` (229 bytes)
- sha1: `e38b94e49517b481c179d0338217d4ec687d8763`
- type: `text`

```text
import React from "react";
import { MainLayout } from "./frontend/layouts/MainLayout";

// Важно: Router должен оставаться ТОЛЬКО в main.tsx!
export default function App() {
  return <MainLayout />;
}

```

### `frontend/ipan/src/components/HeaderBar.tsx` (6169 bytes)
- sha1: `42401f9c1c9f67284046f407fe113e7c83f39483`
- type: `text`

```text
// frontend/ipan/src/components/HeaderBar.tsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Источники значений для Header:
 *   ui.header.height      -> высота (px), по умолчанию 80
 *   ui.header.bg          -> фон, по умолчанию #353535
 *   ui.header.border      -> "1" если нужна нижняя линия, иначе "0"
 *   ui.separator.color    -> цвет линий, по умолчанию #3C3C3C
 *
 * Шрифты: "Amatic SC" как главный для Header.
 */

function getHeaderHeight(): number {
  const v = localStorage.getItem("ui.header.height");
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 80;
}

function getHeaderBg(): string {
  return localStorage.getItem("ui.header.bg") || "#353535";
}

function getHeaderBorder(): boolean {
  return (localStorage.getItem("ui.header.border") || "0") === "1";
}

function getSeparatorColor(): string {
  return localStorage.getItem("ui.separator.color") || "#3C3C3C";
}

function two(n: number) {
  return String(n).padStart(2, "0");
}

const WEEKDAYS_RU = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

function formatDateTime(d: Date) {
  // Пример: "4 ноября 2025 · ВТ · 20:22"
  const day = d.getDate();
  const monthLong = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(d);
  const year = d.getFullYear();
  const wd = WEEKDAYS_RU[d.getDay()];
  const hh = two(d.getHours());
  const mm = two(d.getMinutes());
  return `${day} ${monthLong} ${year} · ${wd} · ${hh}:${mm}`;
}

type HeaderBarProps = {
  sectionGroup?: string;  // Головной раздел, например "ПАНЕЛЬ"
  sectionItem?: string;   // Вложенный, например "DASHBOARD"
  userName?: string;      // Имя пользователя (по умолчанию Master)
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  sectionGroup = "ПАНЕЛЬ",
  sectionItem = "DASHBOARD",
  userName = "Master",
}) => {
  const [now, setNow] = useState<Date>(new Date());

  // таймер часов
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const headerHeight = useMemo(getHeaderHeight, []);
  const headerBg = useMemo(getHeaderBg, []);
  const showBorder = useMemo(getHeaderBorder, []);
  const sepColor = useMemo(getSeparatorColor, []);

  const rootStyle: React.CSSProperties = {
    height: headerHeight,
    background: headerBg,
    borderBottom: showBorder ? `1px solid ${sepColor}` : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    width: "100%",            // В пределах основной (правой) колонки
    fontFamily: `"Amatic SC", "Playpen Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial`,
    color: "#E5E5E5",
    letterSpacing: "0.06em",
  };

  const leftClusterStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  };

  const midTitleStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 700,
    fontSize: 26,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const rightClusterStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
  };

  const iconButton: React.CSSProperties = {
    cursor: "pointer",
    userSelect: "none",
    height: 36,
    width: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    border: "1px solid transparent",
  };

  const metaText: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 24,
  };

  return (
    <div className="headerBar" data-slot="header" style={rootStyle}>
      {/* Левый кластер: Back + Refresh + текущий раздел */}
      <div style={leftClusterStyle}>
        {/* Back — простой символ-стрелка, чтобы не тянуть лишние пакеты */}
        <div
          role="button"
          title="Назад"
          style={iconButton}
          onClick={() => window.history.length > 1 && window.history.back()}
        >
          {/* Символ стрелки влево */}
          <span style={{ fontSize: 22, lineHeight: 1, color: "#E5E5E5" }}>←</span>
        </div>

        {/* Refresh — брендовая иконка */}
        <div
          role="button"
          title="Обновить"
          style={iconButton}
          onClick={() => window.location.reload()}
        >
          <img
            src="/brand/refresh.svg"
            alt="refresh"
            style={{ height: 20, width: 20, display: "block", filter: "invert(90%)" }}
          />
        </div>

        {/* Текущий раздел */}
        <div style={midTitleStyle} aria-label="current-section">
          <span>{sectionGroup}</span>
          <span>·</span>
          <span>{sectionItem}</span>
        </div>
      </div>

      {/* Правый кластер: пользователь · DB · дата/время */}
      <div style={rightClusterStyle}>
        {/* Пользователь */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src="/brand/account.svg"
            alt="user"
            style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}
          />
          <span style={{ ...metaText }}>{userName}</span>
        </div>

        {/* DB online (только иконка) */}
        <img
          src="/brand/base_online.svg"
          alt="db"
          title="DB online"
          style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}
        />

        {/* Дата/время */}
        <div style={metaText}>{formatDateTime(now)}</div>
      </div>
    </div>
  );
};

export default HeaderBar;

```

### `frontend/ipan/src/components/Layout.tsx` (4084 bytes)
- sha1: `5d15c865e95236ffb5c9ceef7ce404a376b01a34`
- type: `text`

```text
// frontend/ipan/src/components/Layout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeaderBar from "./HeaderBar";
import LeftSidebar from "./LeftSidebar";

// helpers: берём настройки из localStorage с дефолтами
const getBool = (k: string, d = true) => (localStorage.getItem(k) ?? (d ? "1" : "0")) === "1";
const getNum  = (k: string, d: number) => {
  const n = Number(localStorage.getItem(k));
  return Number.isFinite(n) && n > 0 ? n : d;
};
const getStr  = (k: string, d: string) => localStorage.getItem(k) || d;

const READ = {
  sidebarOpen: () => getBool("ui.sidebar.open", true),
  wOpen:       () => getNum("ui.sidebar.w_open", 280),
  wClosed:     () => getNum("ui.sidebar.w_closed", 56),
  headerH:     () => getNum("ui.header.height", 80),
  mainBg:      () => getStr("ui.main.bg", "#141414"),
};

export default function Layout() {
  // состояние ширин/высот и открытости
  const [open, setOpen]       = useState(READ.sidebarOpen());
  const [wOpen, setWOpen]     = useState(READ.wOpen());
  const [wClosed, setWClosed] = useState(READ.wClosed());
  const [hHeader, setHHeader] = useState(READ.headerH());
  const [mainBg, setMainBg]   = useState(READ.mainBg());

  // реагируем на изменения настроек (страница Настройки → Интерфейс записывает в localStorage)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "ui.sidebar.w_open")   setWOpen(READ.wOpen());
      if (e.key === "ui.sidebar.w_closed") setWClosed(READ.wClosed());
      if (e.key === "ui.sidebar.open")     setOpen(READ.sidebarOpen());
      if (e.key === "ui.header.height")    setHHeader(READ.headerH());
      if (e.key === "ui.main.bg")          setMainBg(READ.mainBg());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sidebarWidth = open ? wOpen : wClosed;

  // каркас: 2 колонки (меню | правая часть), 2 ряда (Header | контент)
  const rootStyle: React.CSSProperties = {
    height: "100vh",
    display: "grid",
    gridTemplateColumns: `${sidebarWidth}px 1fr`,
    gridTemplateRows: `${hHeader}px 1fr`,
    background: mainBg,
    color: "#E5E5E5",
  };

  const sidebarSlot: React.CSSProperties = {
    gridColumn: 1,
    gridRow: "1 / span 2",
    zIndex: 5, // чтобы клик по «кубу» всегда работал
    width: "100%",
    height: "100%",
  };

  const headerSlot: React.CSSProperties = {
    gridColumn: 2, // ВАЖНО: только правая колонка!
    gridRow: 1,
    zIndex: 3,
  };

  const mainSlot: React.CSSProperties = {
    gridColumn: 2, // только правая колонка
    gridRow: 2,
    overflow: "auto",
    minHeight: 0,
  };

  // заголовок для HeaderBar по url
  const location = useLocation();
  const [sectionGroup, sectionItem] = (() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return ["ПАНЕЛЬ", "DASHBOARD"];
    const g = decodeURI(parts[0]).toUpperCase();
    const i = parts[1] ? decodeURI(parts[1]).toUpperCase() : "SECTION";
    return [g, i];
  })();

  return (
    <div style={rootStyle}>
      {/* Левая колонка */}
      <div style={sidebarSlot}>
        <LeftSidebar
          isOpen={open}
          onToggle={() => {
            const next = !open;
            setOpen(next);
            localStorage.setItem("ui.sidebar.open", next ? "1" : "0");
          }}
        />
      </div>

      {/* Header — строго над правой колонкой */}
      <div style={headerSlot}>
        <HeaderBar sectionGroup={sectionGroup} sectionItem={sectionItem} userName="MASTER" />
      </div>

      {/* Контент маршрутов */}
      <main style={mainSlot}>
        <Outlet />
      </main>
    </div>
  );
}

```

### `frontend/ipan/src/components/LeftSidebar.tsx` (11289 bytes)
- sha1: `fac29be79bb2bd7c0fea31453dec7722f3eb3dd7`
- type: `text`

```text
import React, { useMemo, useState, useEffect } from "react";
import { useUISettings } from "../state/uiSettings";

type MenuItem = { key: string; label: string; icon?: string; children?: MenuItem[] };

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleTheme?: () => void;
  headerHeight: number;
  onNavigate?: (key: string) => void;
  currentPath?: string; // ← добавили: для подсветки активного из router
};

const COLOR_ACTIVE = "#E5E5E5";
const COLOR_MUTED = "#696969";
const ICON_COL = 50;

const MENU: MenuItem[] = [
  { key: "panel", label: "ПАНЕЛЬ", icon: "/brand/base_online.svg" },
  {
    key: "structure", label: "СТРУКТУРА", icon: "/brand/folder.svg",
    children: [
      { key: "structure/users", label: "ПОЛЬЗОВАТЕЛИ", icon: "/brand/folder.svg" },
      { key: "structure/contacts", label: "КОНТАКТЫ", icon: "/brand/folder.svg" },
      { key: "structure/counterparties", label: "КОНТРАГЕНТЫ", icon: "/brand/folder.svg" },
      { key: "structure/brands", label: "БРЕНДЫ", icon: "/brand/folder.svg" },
      { key: "structure/stocks", label: "СКЛАДЫ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "content", label: "КОНТЕНТ", icon: "/brand/folder.svg",
    children: [
      { key: "content/products", label: "ПРОДУКЦИЯ", icon: "/brand/folder.svg" },
      { key: "content/articles", label: "СТАТЬИ", icon: "/brand/folder.svg" },
      { key: "content/sites", label: "САЙТЫ", icon: "/brand/folder.svg" },
      { key: "content/mailing", label: "РАССЫЛКИ", icon: "/brand/folder.svg" },
      { key: "content/offers", label: "АКЦИИ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "process", label: "ПРОЦЕССЫ", icon: "/brand/folder.svg",
    children: [
      { key: "process/orders", label: "ЗАЯВКИ", icon: "/brand/folder.svg" },
      { key: "process/proposals", label: "ПРЕДЛОЖЕНИЯ", icon: "/brand/folder.svg" },
      { key: "process/invoices", label: "СЧЕТА", icon: "/brand/folder.svg" },
      { key: "process/contracts", label: "ДОГОВОРЫ", icon: "/brand/folder.svg" },
      { key: "process/mailing", label: "РАССЫЛКА", icon: "/brand/folder.svg" },
      { key: "process/parsing", label: "ПАРСИНГ", icon: "/brand/folder.svg" },
      { key: "process/flows", label: "ПРОЦЕССЫ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "docs", label: "ДОКУМЕНТЫ", icon: "/brand/folder.svg",
    children: [
      { key: "docs/letters", label: "ПИСЬМА", icon: "/brand/folder.svg" },
      { key: "docs/incoming", label: "ВХОДЯЩИЕ СЧЕТА", icon: "/brand/folder.svg" },
      { key: "docs/receipts", label: "ПОСТУПЛЕНИЯ", icon: "/brand/folder.svg" },
      { key: "docs/sales", label: "РЕАЛИЗАЦИИ", icon: "/brand/folder.svg" },
      { key: "docs/shipments", label: "ОТГРУЗКИ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "tools", label: "ИНСТРУМЕНТЫ", icon: "/brand/folder.svg",
    children: [
      { key: "tools/lex", label: "LEX", icon: "/brand/folder.svg" },
      { key: "tools/api", label: "API", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "settings", label: "НАСТРОЙКИ", icon: "/brand/options.svg",
    children: [
      { key: "settings/interface", label: "ИНТЕРФЕЙС", icon: "/brand/options.svg" },
      { key: "settings/templates", label: "ШАБЛОНЫ", icon: "/brand/folder.svg" },
      { key: "settings/rights", label: "ПРАВА", icon: "/brand/folder.svg" },
    ],
  },
];

const LeftSidebar: React.FC<Props> = ({
  collapsed, onToggleCollapsed, onToggleTheme, headerHeight, onNavigate, currentPath,
}) => {
  const {
    childIndentPx, groupFontWeight, childFontWeight,
    leftSidebarBg, sidebarWidthOpen, sidebarWidthCollapsed,
    showSidebarSeparator, lineColor,
  } = useUISettings();

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [activeKey, setActiveKey] = useState<string>("");

  // синхронизация активного пункта с адресной строкой
  useEffect(() => {
    if (!currentPath) return;
    // currentPath вида "settings/interface" или "process/orders"
    setActiveKey(currentPath);
    // автоматически раскрываем нужную группу
    const top = currentPath.split("/")[0];
    if (top) {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        next.add(top);
        return next;
      });
    }
  }, [currentPath]);

  const width = useMemo(
    () => (collapsed ? sidebarWidthCollapsed : sidebarWidthOpen),
    [collapsed, sidebarWidthCollapsed, sidebarWidthOpen]
  );

  const txtBase: React.CSSProperties = {
    fontFamily: "'Amatic SC', cursive",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontSize: 24,
    margin: 0,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    lineHeight: 1.25,
  };

  const iconColor = (active: boolean) =>
    active ? "none"
           : "invert(49%) sepia(0%) saturate(0%) hue-rotate(175deg) brightness(90%) contrast(90%)";

  const handleGroupClick = (key: string) => {
    const next = new Set(openKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setOpenKeys(next);
  };
  const handleItemClick = (key: string) => {
    setActiveKey(key);
    onNavigate?.(key);
  };

  return (
    <aside
      style={{
        position: "fixed",
        inset: 0,
        right: undefined,
        width,
        background: leftSidebarBg,
        borderRight: showSidebarSeparator ? `1px solid ${lineColor}` : "none",
        zIndex: 900,
        transition: "width 150ms ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Логотипы */}
      <div
        style={{
          height: headerHeight,
          display: "flex",
          alignItems: "center",
          paddingLeft: 10,
          gap: 8,
        }}
      >
        <img
          src="/brand/logo_ipan.svg" alt="iPan"
          width={28} height={28}
          style={{ cursor: "pointer" }}
          onClick={onToggleCollapsed}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        />
        {!collapsed && <img src="/brand/logo_ipan_word.svg" alt="iPan Word" style={{ height: 20 }} />}
      </div>

      {/* Навигация */}
      <nav aria-label="Основное меню" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {MENU.map((g) => {
          const groupOpen = openKeys.has(g.key);

          const GroupRow = (
            <div
              key={g.key}
              role="button" title={g.label}
              onClick={() => handleGroupClick(g.key)}
              style={{
                display: "grid",
                gridTemplateColumns: `${ICON_COL}px ${collapsed ? "0" : "1fr"}`,
                alignItems: "center",
                minHeight: 50,
                paddingRight: 10,
                cursor: "pointer",
                color: COLOR_MUTED,
                position: "relative",
              }}
            >
              <div style={{ width: ICON_COL, height: 50, display: "grid", placeItems: "center" }}>
                <img
                  src={g.icon || "/brand/folder.svg"} alt="" width={24} height={24}
                  style={{ filter: iconColor(false) }}
                />
              </div>

              {!collapsed && (
                <h4
                  style={{
                    ...txtBase,
                    fontWeight: groupFontWeight,
                    color: COLOR_MUTED,
                    paddingBlock: 6,
                  }}
                >
                  {g.label}
                </h4>
              )}
            </div>
          );

          const Children =
            g.children && groupOpen
              ? g.children.map((it) => {
                  const isActive = activeKey === it.key;
                  const color = isActive ? COLOR_ACTIVE : COLOR_MUTED;

                  return (
                    <div
                      key={it.key}
                      role="button" title={it.label}
                      onClick={() => handleItemClick(it.key)}
                      style={{
                        display: "grid",
... (truncated)

```

### `frontend/ipan/src/components/SplitPane.tsx` (647 bytes)
- sha1: `8c80846a69dedf976713b3d6f952f4ab34c368ac`
- type: `text`

```text
// frontend/ipan/src/components/SplitPane.tsx
import React from "react";

type Props = { children?: React.ReactNode };

// Ничего не рисуем и ничего не перехватываем.
// Даже если страницы продолжают импортировать SplitPane/Divider — мы их глушим.
export default function SplitPane({ children }: Props) {
  return <>{children}</>;
}

// Если где-то импортируется именованный Divider — он тоже «молчит».
export function VerticalDivider() {
  return null;
}
export function HorizontalDivider() {
  return null;
}

```

### `frontend/ipan/src/components/TabsBar.tsx` (893 bytes)
- sha1: `65911c2c10d28137ee36c17c1d00c2dedc358b9a`
- type: `text`

```text
import { Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'

export default function TabsBar() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        textColor="inherit"               // не красим текст в пурпурный у активного
        sx={{
          pl: 0,
          minHeight: 42,
          '& .MuiTab-root': { minHeight: 42, color: 'text.primary' },
          '& .Mui-selected': { color: 'text.primary' }, // на всякий
        }}
        TabIndicatorProps={{ sx: { height: 4, bgcolor: 'text.primary' } }} // 4px, цвет как у текста
      >
        <Tab label="SECTION_1" />
        <Tab label="SECTION_2" />
        <Tab label="SECTION_K" />
      </Tabs>
    </Box>
  )
}

```

### `frontend/ipan/src/config/app-menu.json` (469 bytes)
- sha1: `d2b29b77fe004ddc3782976438bd15ea813ff806`
- type: `text`

```text
{
  "groups": [
    {
      "title": "ПАНЕЛЬ",
      "items": [
        { "id": "dashboard", "label": "Dashboard", "icon": "panel" }
      ]
    },
    {
      "title": "КОНТЕНТ",
      "items": [
        { "id": "articles", "label": "Статьи", "icon": "folder" }
      ]
    },
    {
      "title": "НАСТРОЙКИ",
      "items": [
        { "id": "ui", "label": "Интерфейс", "icon": "gear" }
      ]
    }
  ]
}

```

### `frontend/ipan/src/frontend/carcass/CarcassShell.tsx` (1799 bytes)
- sha1: `9b1444f17a2b4e40d3e35e42c6b33c900386ab70`
- type: `text`

```text
import React, { ReactNode } from "react";
import cfg from "./configs/main-carcass.json";
import { CarcassConfig } from "./types";

type Areas = {
  header?: ReactNode;
  left?: ReactNode;
  main?: ReactNode;
  right?: ReactNode;
};

const config = cfg as CarcassConfig;

export function CarcassShell({ header, left, main, right }: Areas) {
  const gridCols = `${config.leftWidth}px 1fr ${Math.max(config.rightWidth ?? 0, 0)}px`;
  const gridRows = `${config.headerHeight}px 1fr`;

  const line = `1px solid ${config.colors.line}`;

  return (
    <div
      style={{
        height: "100vh",
        background: config.colors.bodyBg,
        display: "grid",
        gridTemplateColumns: gridCols,
        gridTemplateRows: gridRows,
        gridTemplateAreas: `"header header header" "left main right"`
      }}
    >
      {/* HEADER */}
      <div
        style={{
          gridArea: "header",
          background: config.colors.headerBg,
          borderBottom: config.showHeaderDivider ? line : "none"
        }}
      >
        {header}
      </div>

      {/* LEFT */}
      <div
        style={{
          gridArea: "left",
          borderRight: config.showLeftDivider ? line : "none",
          overflow: "hidden", // прокрутка внутри самого меню
          background: "transparent"
        }}
      >
        {left}
      </div>

      {/* MAIN */}
      <div style={{ gridArea: "main", overflow: "auto" }}>{main}</div>

      {/* RIGHT (опционально) */}
      {config.rightWidth && config.rightWidth > 0 ? (
        <div style={{ gridArea: "right", borderLeft: line, overflow: "auto" }}>{right}</div>
      ) : (
        <div style={{ display: "none" }} />
      )}
    </div>
  );
}

```

### `frontend/ipan/src/frontend/carcass/configs/main-carcass.json` (226 bytes)
- sha1: `d990ffbe5b3d072ab966d346f4a35d2b21f208da`
- type: `text`

```text
{
  "leftWidth": 280,
  "rightWidth": 0,
  "headerHeight": 56,
  "showLeftDivider": true,
  "showHeaderDivider": false,
  "colors": {
    "headerBg": "#353535",
    "bodyBg": "#141414",
    "line": "#3C3C3C"
  }
}

```

### `frontend/ipan/src/frontend/carcass/types.ts` (352 bytes)
- sha1: `9b6229bb60576fbf710ed4248375b011b3e2e252`
- type: `text`

```text
export interface CarcassColors {
  headerBg: string;
  bodyBg: string;
  line: string;
}

export interface CarcassConfig {
  leftWidth: number;         // px
  rightWidth?: number;       // px (опционально)
  headerHeight: number;      // px
  showLeftDivider: boolean;
  showHeaderDivider: boolean;
  colors: CarcassColors;
}

```

### `frontend/ipan/src/frontend/layouts/MainLayout.tsx` (2958 bytes)
- sha1: `9615a1e404dfdbe47741a9b84b5477df2e1927da`
- type: `text`

```text
import React, { useState } from "react";
import { CarcassShell } from "../carcass/CarcassShell";
import { MenuPanel } from "../widgets/MenuPanel/MenuPanel";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState<string>("dashboard");

  return (
    <CarcassShell
      header={
        <div
          style={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            color: "#E5E5E5",
            fontFamily: "'Amatic SC', cursive",
            padding: "0 16px",
            gap: 16
          }}
        >
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => history.back()} title="Back">↶</button>
            <button onClick={() => location.reload()} title="Refresh">⟳</button>
            <div style={{ fontSize: 28, letterSpacing: 2 }}>
              {section === "articles" ? "КОНТЕНТ · СТАТЬИ" : "ПАНЕЛЬ · DASHBOARD"}
            </div>
          </div>

          {/* СЕРЕДИНА — пустая, при необходимости сюда перенесём «хлебные крошки» */}
          <div />

          {/* ПРАВАЯ ЧАСТЬ */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22 }}>
            <span title="Пользователь">MASTER</span>
            <span title="DB">🟣</span>
            <time>
              {new Date().toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric", weekday: "short"
              }).replace(",", "")}
              {" · "}
              {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </time>
          </div>
        </div>
      }
      left={
        <div style={{ height: "100%", display: "grid", gridTemplateRows: "1fr 60px" }}>
          {/* верх меню */}
          <MenuPanel onSelect={setSection} collapsed={collapsed} />
          {/* низ меню: кнопка темы + версия */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8 }}>
            <button onClick={() => document.documentElement.classList.toggle("light")}>☀︎</button>
            <button onClick={() => setCollapsed((v) => !v)} title="Свернуть / раскрыть">≡</button>
            <span style={{ opacity: 0.6 }}>V1.0</span>
          </div>
        </div>
      }
      main={
        <div style={{ padding: 16, color: "#E5E5E5", fontFamily: "'Playpen Sans', cursive" }}>
          {section === "articles" ? "МОДУЛЬ СТАТЕЙ (заглушка)" : "Dashboard (заглушка)"}
        </div>
      }
    />
  );
}

```

### `frontend/ipan/src/frontend/widgets/MenuPanel/MenuPanel.tsx` (1826 bytes)
- sha1: `659ae15826e1c78c34c511a2e80eeb5d7e1d732e`
- type: `text`

```text
import React from "react";
import menu from "../../../config/app-menu.json";

type MenuItem = { id: string; label: string; icon?: string };
type MenuGroup = { title: string; items: MenuItem[] };
const groups = menu.groups as MenuGroup[];

interface Props {
  onSelect: (id: string) => void;
  collapsed: boolean;
}

export function MenuPanel({ onSelect, collapsed }: Props) {
  return (
    <div style={{ height: "100%", color: "#E5E5E5", fontFamily: "'Amatic SC', cursive" }}>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        {/* логотипы */}
        {!collapsed && <img src="/brand/logo_ipan_word.svg" height={22} alt="iPan" />}
      </div>

      <div style={{ padding: "4px 0", overflowY: "auto", height: "calc(100% - 42px)" }}>
        {groups.map((g) => (
          <div key={g.title} style={{ margin: "8px 8px 12px" }}>
            {!collapsed && (
              <div style={{ opacity: 0.5, letterSpacing: 2, margin: "6px 6px 2px" }}>{g.title}</div>
            )}
            {g.items.map((it) => (
              <div
                key={it.id}
                onClick={() => onSelect(it.id)}
                style={{
                  cursor: "pointer",
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 10px"
                }}
              >
                {/* здесь могут быть твои SVG-иконки */}
                <span style={{ width: 24, textAlign: "center" }}>▣</span>
                {!collapsed && <span style={{ fontSize: 22 }}>{it.label.toUpperCase()}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

```

### `frontend/ipan/src/index.css` (1555 bytes)
- sha1: `3a0c72e648a59bb13eae1cc596ca9b7422d1c109`
- type: `text`

```text
/* ---- Base reset ---- */
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }

/* Глобальный UI-шрифт по умолчанию */
body {
  font-family: "Playpen Sans", system-ui, -apple-system, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Переменные шрифтов */
:root{
  --font-title: "Amatic SC", "Playpen Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  --font-ui:    "Playpen Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}

/* Явно задаём Amatic SC для левої панели и хедера */
.leftSidebar,
[data-slot="left-sidebar"],
.headerBar,
[data-slot="header"]{
  font-family: var(--font-title);
}

/* Остальное — UI-шрифт */
.mainContent,
[data-slot="main"]{
  font-family: var(--font-ui);
}

/* Жёстко скрываем любые прежние разделители/резайзеры, если где-то остались */
.resizer,
.splitter,
.v-divider,
.h-divider,
[role="separator"],
[data-resizer],
[data-splitter] {
  display: none !important;
  pointer-events: none !important;
}

/* Временная страховка: убираем случайные левые бордеры в корневых контейнерах страниц */
main > div {
  border-left: none !important;
}
```

### `frontend/ipan/src/main.tsx` (324 bytes)
- sha1: `210d536e79c89ad7f85c5d61552ce94e695a94d4`
- type: `text`

```text
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

```

### `frontend/ipan/src/pages/Dashboard.tsx` (1281 bytes)
- sha1: `6040cdbed953025e8aeec754aa30fc7d9296c1ec`
- type: `text`

```text
import { Box, Paper, Typography } from '@mui/material'
import SplitPane from '../components/SplitPane'

function Placeholder({ label }: { label: string }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>{label}</Typography>
    </Box>
  )
}

export default function Dashboard() {
  return (
    <Box sx={{ height: '100%' }}>
      <SplitPane direction="vertical" initial={28} minA={16} minB={20} storageKey="ipan:dash:main" height="100%">
        {/* слева: фильтр/каталог (горизонтальный сплит) */}
        <SplitPane direction="horizontal" initial={40} minA={16} minB={16} storageKey="ipan:dash:left">
          <Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider', borderBottom: '2px solid' }}>
            <Placeholder label="filters_block" />
          </Box>
          <Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider' }}>
            <Placeholder label="catalogue_list" />
          </Box>
        </SplitPane>

        {/* центр: основное окно */}
        <Paper sx={{ height: '100%' }}>
          <Placeholder label="main_content_window" />
        </Paper>
      </SplitPane>
    </Box>
  )
}

```

### `frontend/ipan/src/pages/LEX.tsx` (1032 bytes)
- sha1: `945e85cb7df8e1f3b8df59e9d257376736881c99`
- type: `text`

```text
import { useEffect, useState } from 'react'
import { Card, CardContent, Typography, MenuItem, TextField, Box } from '@mui/material'
import { marked } from 'marked'

const files = [
  { label: 'README', path: '/lex/README.md' },
]

export default function LEX() {
  const [content, setContent] = useState('<p>Выберите документ</p>')
  const [file, setFile] = useState(files[0].path)

  useEffect(() => {
    fetch(file).then(r => r.text()).then(md => setContent(marked.parse(md)))
  }, [file])

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">LEX (документация)</Typography>
          <TextField select size="small" value={file} onChange={(e) => setFile(e.target.value)}>
            {files.map(f => <MenuItem key={f.path} value={f.path}>{f.label}</MenuItem>)}
          </TextField>
        </Box>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </CardContent>
    </Card>
  )
}

```

### `frontend/ipan/src/pages/Orders.tsx` (1979 bytes)
- sha1: `653d675103d306ddd5813bafdfe86ab5b6689ab4`
- type: `text`

```text
import { Box, Stack, Typography, TextField, Button, List, ListItemButton, ListItemText } from '@mui/material'
import SplitPane from '../components/SplitPane'

export default function Orders() {
  return (
    <Box sx={{ height: '100%' }}>
      <SplitPane direction="vertical" initial={34} minA={18} minB={30} storageKey="ipan:orders:split" height="100%">
        <Box sx={{ height: '100%', p: 2, borderRight: '2px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Фильтр</Typography>
          <Stack spacing={1.25}>
            <TextField size="small" label="Ответственный" />
            <TextField size="small" label="Организация" />
            <TextField size="small" label="Этап" />
            <TextField size="small" label="Приоритет" />
            <TextField size="small" label="Период" />
            <TextField size="small" label="Теги" />
            <Stack direction="row" spacing={1}>
              <Button variant="contained">Применить</Button>
              <Button variant="outlined">Очистить</Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Заявки</Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List dense disablePadding>
              {['01.11.2025, 06:59','31.10.2025, 13:44','31.10.2025, 08:36'].map((t, i) => (
                <ListItemButton key={i} sx={{ px: 2, py: 1, borderBottom: '2px solid', borderColor: 'divider' }}>
                  <ListItemText primary={t} secondary="Новая · Заказ с сайта · ПМК" />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      </SplitPane>
    </Box>
  )
}

```

### `frontend/ipan/src/pages/SettingsInterface.tsx` (7913 bytes)
- sha1: `bbfbdcf4e53ef2a61cca8378586df36850c58418`
- type: `text`

```text
import React, { useEffect, useState } from "react";
import {
  useUISettings,
  setChildIndentPx, setGroupFontWeight, setChildFontWeight,
  setLeftSidebarBg, setSidebarWidthOpen, setSidebarWidthCollapsed, setShowSidebarSeparator,
  setHeaderBg, setHeaderHeight, setShowHeaderSeparator,
  setLineColor,
} from "../state/uiSettings";

const wrap: React.CSSProperties = {
  padding: 16, color: "#E5E5E5", fontFamily: "'Playpen Sans', system-ui, sans-serif",
};
const card: React.CSSProperties = {
  border: "1px solid #3C3C3C", borderRadius: 10, padding: 16, maxWidth: 720, background: "#141414", marginBottom: 16,
};

function NumberControl(props: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; suffix?: string;
}) {
  const { label, min, max, step = 10, value, onChange, suffix } = props;
  return (
    <div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="range" min={min} max={max} step={step} value={value}
               onChange={(e) => onChange(parseInt(e.target.value || "0", 10))} style={{ flex: 1 }} />
        <input type="number" min={min} max={max} step={step} value={value}
               onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
               style={{ width: 110, background: "#0f1010", color: "#E5E5E5",
                        border: "1px solid #3C3C3C", borderRadius: 8, padding: "6px 10px", fontSize: 16 }} />
        {suffix && <span style={{ opacity: 0.7 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ColorControl(props: { label: string; value: string; onChange: (v: string) => void; }) {
  const { label, value, onChange } = props;
  return (
    <div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <input type="color" value={value}
             onChange={(e) => onChange((e.target as HTMLInputElement).value)}
             style={{ width: 60, height: 36, background: "transparent", border: "1px solid #3C3C3C", borderRadius: 8 }} />
      <span style={{ marginLeft: 12, opacity: 0.8 }}>{value}</span>
    </div>
  );
}

function ToggleControl(props: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  const { label, checked, onChange } = props;
  return (
    <div style={card}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    </div>
  );
}

export default function SettingsInterface() {
  const s = useUISettings();

  // локальные стейты для контроля слайдерами — отображаем актуальные значения
  const [indent, setIndent] = useState(s.childIndentPx);
  const [wGroup, setWGroup] = useState(s.groupFontWeight);
  const [wChild, setWChild] = useState(s.childFontWeight);

  const [leftBg, setLeftBg] = useState(s.leftSidebarBg);
  const [wOpen, setWOpen] = useState(s.sidebarWidthOpen);
  const [wCollapsed, setWCollapsed] = useState(s.sidebarWidthCollapsed);
  const [vSep, setVSep] = useState(s.showSidebarSeparator);

  const [hdrBg, setHdrBg] = useState(s.headerBg);
  const [hdrH, setHdrH] = useState(s.headerHeight);
  const [hSep, setHSep] = useState(s.showHeaderSeparator);

  const [lineColor, setLColor] = useState(s.lineColor);

  // синхронизация при внешних изменениях
  useEffect(() => { setIndent(s.childIndentPx); }, [s.childIndentPx]);
  useEffect(() => { setWGroup(s.groupFontWeight); }, [s.groupFontWeight]);
  useEffect(() => { setWChild(s.childFontWeight); }, [s.childFontWeight]);

  useEffect(() => { setLeftBg(s.leftSidebarBg); }, [s.leftSidebarBg]);
  useEffect(() => { setWOpen(s.sidebarWidthOpen); }, [s.sidebarWidthOpen]);
  useEffect(() => { setWCollapsed(s.sidebarWidthCollapsed); }, [s.sidebarWidthCollapsed]);
  useEffect(() => { setVSep(s.showSidebarSeparator); }, [s.showSidebarSeparator]);

  useEffect(() => { setHdrBg(s.headerBg); }, [s.headerBg]);
  useEffect(() => { setHdrH(s.headerHeight); }, [s.headerHeight]);
  useEffect(() => { setHSep(s.showHeaderSeparator); }, [s.showHeaderSeparator]);

  useEffect(() => { setLColor(s.lineColor); }, [s.lineColor]);

  return (
    <div style={wrap}>
      <h2 style={{ marginTop: 0, fontFamily: "'Amatic SC', cursive", fontSize: 36 }}>Настройки интерфейса</h2>

      {/* Левое меню */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Левое меню</h3>
      <ColorControl
        label="Цвет фона левого меню"
        value={leftBg}
        onChange={(v) => { setLeftBg(v); setLeftSidebarBg(v); }}
      />
      <NumberControl
        label="Ширина меню (развёрнуто)"
        min={220} max={480} step={2}
        value={wOpen}
        onChange={(v) => { setWOpen(v); setSidebarWidthOpen(v); }}
        suffix="px"
      />
      <NumberControl
        label="Ширина меню (свернуто)"
        min={44} max={80} step={1}
        value={wCollapsed}
        onChange={(v) => { setWCollapsed(v); setSidebarWidthCollapsed(v); }}
        suffix="px"
      />
      <ToggleControl
        label="Показывать вертикальную линию-границу справа от меню"
        checked={vSep}
        onChange={(b) => { setVSep(b); setShowSidebarSeparator(b); }}
      />

      {/* Header */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Header</h3>
      <ColorControl
        label="Цвет фона Header"
        value={hdrBg}
        onChange={(v) => { setHdrBg(v); setHeaderBg(v); }}
      />
      <NumberControl
        label="Высота Header"
        min={40} max={120} step={2}
        value={hdrH}
        onChange={(v) => { setHdrH(v); setHeaderHeight(v); }}
        suffix="px"
      />
      <ToggleControl
        label="Показывать горизонтальную линию-границу снизу Header"
        checked={hSep}
        onChange={(b) => { setHSep(b); setShowHeaderSeparator(b); }}
      />

      {/* Линии */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Отделяющие линии</h3>
      <ColorControl
        label="Цвет линий-разделителей"
        value={lineColor}
        onChange={(v) => { setLColor(v); setLineColor(v); }}
      />

      {/* Уже существующие параметры */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Существующие</h3>
      <NumberControl
        label="Смещение дочерних разделов меню (только в развёрнутом виде)"
        min={0} max={120} step={2}
        value={indent}
        onChange={(v) => { setIndent(v); setChildIndentPx(v); }}
        suffix="px"
      />
      <NumberControl
        label="Толщина шрифта головных разделов"
        min={100} max={900} step={10}
        value={wGroup}
        onChange={(v) => { setWGroup(v); setGroupFontWeight(v); }}
      />
      <NumberControl
        label="Толщина шрифта вложенных разделов"
        min={100} max={900} step={10}
        value={wChild}
        onChange={(v) => { setWChild(v); setChildFontWeight(v); }}
      />

      <p style={{ color: "#9aa0a6", fontSize: 14, marginTop: 8 }}>
        Все настройки сохраняются локально и автоматически применяются при следующем запуске.
      </p>
    </div>
  );
}

```

### `frontend/ipan/src/pages/Stub.tsx` (1477 bytes)
- sha1: `ac35091c5b6f9d110c62944b3e4f525422be6421`
- type: `text`

```text
import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'

const NAMES: Record<string, string> = {
  dashboard: 'Dashboard', tasks: 'Задачи', comments: 'Комментарии', comms: 'Коммуникации', tags: 'Теги',
  contacts: 'Контакты', counterparty: 'Контрагенты', users: 'Пользователи', groups: 'Группы пользователей', warehouses: 'Склады',
  products: 'Товары и услуги', chars: 'Характеристик', brands: 'Бренды', units: 'Единицы измерения', kinds: 'Виды номенклатуры',
  quotes: 'Коммерческие предложения', invoices: 'Счета',
  payments: 'Платежи', contracts: 'Договоры', sales: 'Реализации', receipts: 'Поступления', shipments: 'Отгрузки',
  bills_in: 'Входящие счета', letters: 'Официальные письма',
  lex_docs: 'LEX: Документация', lex_tasks: 'LEX: Задачи',
}

export default function Stub() {
  const { key } = useParams()
  const title = (key && NAMES[key]) || 'Раздел'
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        Заглушка. Здесь будет интерфейс «{title}».
      </Typography>
    </Box>
  )
}

```

### `frontend/ipan/src/state/uiSettings.ts` (3673 bytes)
- sha1: `2558b9118402c48c79d87469c39609a3108dcbae`
- type: `text`

```text
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ipan.ui.settings.v2";

export type Settings = {
  // уже были
  childIndentPx: number;
  groupFontWeight: number;
  childFontWeight: number;

  // НОВОЕ: левое меню и разделители
  leftSidebarBg: string;              // (1) цвет фона левого меню
  sidebarWidthOpen: number;           // (2) ширина меню раскрытого
  sidebarWidthCollapsed: number;      // (3) ширина меню свернутого
  showSidebarSeparator: boolean;      // (4) показывать вертикальный разделитель справа от меню

  // НОВОЕ: header
  headerBg: string;                   // (5) цвет фона Header
  headerHeight: number;               // (6) высота Header
  showHeaderSeparator: boolean;       // (7) показывать горизонтальный разделитель снизу Header

  // (8) единый цвет линий-разделителей
  lineColor: string;
};

function defaults(): Settings {
  return {
    childIndentPx: 24,
    groupFontWeight: 700,
    childFontWeight: 600,

    leftSidebarBg: "#0f1010",
    sidebarWidthOpen: 300,
    sidebarWidthCollapsed: 56,
    showSidebarSeparator: true,

    headerBg: "#353535",
    headerHeight: 56,
    showHeaderSeparator: false,

    lineColor: "#3C3C3C",
  };
}

function load(): Settings {
  const d = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw);
    return { ...d, ...p };
  } catch {
    return d;
  }
}

let state: Settings = load();
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());
const save = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

// helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(n)));
const clampWeight = (n: number) => clamp(n, 100, 900);

// ========== setters (бывшие) ==========
export function setChildIndentPx(n: number) {
  state = { ...state, childIndentPx: clamp(n, 0, 120) }; save(); emit();
}
export function setGroupFontWeight(n: number) {
  state = { ...state, groupFontWeight: clampWeight(n) }; save(); emit();
}
export function setChildFontWeight(n: number) {
  state = { ...state, childFontWeight: clampWeight(n) }; save(); emit();
}

// ========== setters (НОВЫЕ) ==========
export function setLeftSidebarBg(v: string) {
  state = { ...state, leftSidebarBg: v || "#0f1010" }; save(); emit();
}
export function setSidebarWidthOpen(n: number) {
  state = { ...state, sidebarWidthOpen: clamp(n, 220, 480) }; save(); emit();
}
export function setSidebarWidthCollapsed(n: number) {
  state = { ...state, sidebarWidthCollapsed: clamp(n, 44, 80) }; save(); emit();
}
export function setShowSidebarSeparator(b: boolean) {
  state = { ...state, showSidebarSeparator: !!b }; save(); emit();
}

export function setHeaderBg(v: string) {
  state = { ...state, headerBg: v || "#353535" }; save(); emit();
}
export function setHeaderHeight(n: number) {
  state = { ...state, headerHeight: clamp(n, 40, 120) }; save(); emit();
}
export function setShowHeaderSeparator(b: boolean) {
  state = { ...state, showHeaderSeparator: !!b }; save(); emit();
}

export function setLineColor(v: string) {
  state = { ...state, lineColor: v || "#3C3C3C" }; save(); emit();
}

// ========== hook ==========
export function useUISettings() {
  return useSyncExternalStore<Settings>(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => state,
    () => state
  );
}

```

### `frontend/ipan/src/theme/theme.ts` (2269 bytes)
- sha1: `c85794d9a102cc9c53e98d4306872057d6ae96b3`
- type: `text`

```text
// frontend/ipan/src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

export const tokens = {
  headerBg: "#353535",
  appBgDark: "#141414",
  appBgLight: "#f7f3e9",
  sep: "#3C3C3C",
  sepHover: "#E5E5E5",
  ink: "#E5E5E5",
  accents: {
    sage: "#8faa8c",
    lavender: "#b8a6d9",
    cornflower: "#8eaedb",
    rose: "#cf9aac",
    amber: "#e7d18a",
    teal: "#82b5b1",
  },
};

// Базовая типографика: Amatic SC для заголовков/акцентов, Playpen Sans — для контента
const typography = {
  fontFamily: `"Playpen Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
  h1: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 1 },
  h2: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 1 },
  h3: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 0.5 },
  button: { textTransform: "none", fontWeight: 600 },
} as const;

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: tokens.appBgDark, paper: tokens.appBgDark },
    text: { primary: tokens.ink },
    primary: { main: tokens.accents.lavender },
    secondary: { main: tokens.accents.teal },
    divider: tokens.sep,
  },
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --header-bg: ${tokens.headerBg};
          --app-bg: ${tokens.appBgDark};
          --sep: ${tokens.sep};
          --sep-hover: ${tokens.sepHover};
          --ink: ${tokens.ink};
        }
        body { background: var(--app-bg); }
      `,
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: tokens.appBgLight, paper: "#fffdfa" },
    text: { primary: "#2a2a2a" },
    primary: { main: tokens.accents.lavender },
    secondary: { main: tokens.accents.teal },
    divider: "#e7e1d1",
  },
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --header-bg: ${tokens.headerBg};
          --app-bg: ${tokens.appBgLight};
          --sep: #e7e1d1;
          --sep-hover: #2a2a2a;
          --ink: #2a2a2a;
        }
        body { background: var(--app-bg); }
      `,
    },
  },
});

```

### `start-dev.ps1` (293 bytes)
- sha1: `76318741e347c6357f31114cf17cfe5c10b0843b`
- type: `text`

```text
# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\.code\.ipan\frontend\ipan; npm run dev"

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\.code\.ipan; .\.venv\Scripts\Activate; uvicorn backend.app.main:app --reload --port 8000"
```

