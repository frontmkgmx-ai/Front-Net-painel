#!/bin/bash
set -euo pipefail
echo "[INFO] Starting MyCloud Panel services..."
docker compose up -d
./scripts/status.sh
