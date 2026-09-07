#!/bin/bash
set -euo pipefail
echo "[INFO] Stopping MyCloud Panel services..."
docker compose stop
echo "[SUCCESS] Services stopped."
