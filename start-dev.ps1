# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\.code\.ipan\frontend\ipan; npm run dev"

# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\.code\.ipan; .\.venv\Scripts\Activate; uvicorn backend.app.main:app --reload --port 8000"