#!/bin/sh
set -e
python -c "from app import ensure_db; ensure_db()"
exec gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 1 --threads 4 app:app
