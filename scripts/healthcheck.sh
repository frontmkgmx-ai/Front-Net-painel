#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

echo "[INFO] Running Docker Compose Healthchecks..."
docker compose ps | grep -E "unhealthy|starting" || echo "[SUCCESS] All containers are healthy or running."
