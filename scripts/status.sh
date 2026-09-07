#!/bin/bash
set -euo pipefail
echo "========================================"
echo "   MyCloud Panel - System Status"
echo "========================================"
echo "[Containers]"
docker compose ps
echo "========================================"
echo "[System Resource Usage]"
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'
df -h | awk '$NF=="/"{printf "Disk Usage: %d/%dGB (%s)\n", $3,$2,$5}'
uptime
echo "========================================"
