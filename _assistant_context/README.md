# _assistant_context — Rebuilt (lean)
Мини-утилита для сборки контекста проекта в два файла:
- `_assistant_context/out/assistant_context.json`
- `_assistant_context/out/assistant_context.md`

## Запуск
```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r _assistant_context\requirements.txt
.\.venv\Scripts\python _assistant_context\context_assistant.py --project-root .
```
