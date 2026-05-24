#!/bin/sh
set -e

# Resolve the absolute directory of this script regardless of how it is invoked
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[Ollive] Running database migrations..."
alembic -c "$SCRIPT_DIR/alembic.ini" upgrade head
echo "[Ollive] Migrations complete. Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
