#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

echo "[INFO] Updating MyCloud Panel Enterprise v3.0..."

echo "[INFO] Creating pre-update backup..."
./scripts/backup.sh || {
    echo "[ERROR] Pre-update backup failed. Aborting update to prevent data loss."
    exit 1
}

echo "[INFO] Pulling latest code..."
git pull origin main

echo "[INFO] Pulling base images..."
docker compose pull

echo "[INFO] Rebuilding and starting containers..."
docker compose up -d --build

echo "[INFO] Running database migrations..."
sleep 15
./scripts/migrate.sh

echo "[INFO] Cleaning up dangling images..."
docker image prune -f

echo "[SUCCESS] Update completed successfully!"
./scripts/status.sh
