#!/bin/bash
set -euo pipefail
echo "[INFO] Running Prisma Database Migrations..."
docker compose exec -T backend npx prisma migrate deploy
echo "[SUCCESS] Migrations completed!"
