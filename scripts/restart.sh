#!/bin/bash
set -euo pipefail
echo "[INFO] Restarting MyCloud Panel services..."
docker compose restart
./scripts/status.sh
