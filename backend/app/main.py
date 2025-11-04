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
