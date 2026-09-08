#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

echo "[INFO] Running Prisma Database Migrations..."
docker compose exec -T backend /app/entrypoint.sh npx prisma migrate deploy
echo "[SUCCESS] Migrations completed!"
