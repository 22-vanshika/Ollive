#!/bin/sh
set -e

echo "[Ollive] Working dir: $(pwd)"
echo "[Ollive] Files in /app:"
ls /app

echo "[Ollive] Running database migrations..."
alembic -c /app/alembic.ini upgrade head
echo "[Ollive] Migrations complete. Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
