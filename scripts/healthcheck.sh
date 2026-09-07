#!/bin/bash
set -euo pipefail
echo "========================================"
echo "   MyCloud Panel - Healthcheck"
echo "========================================"

check_service() {
  local container=$1
  local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unhealthy")
  if [ "$status" == "healthy" ]; then
    echo "[OK] $container is healthy."
  else
    echo "[ERROR] $container is $status."
  fi
}

check_service "mycloud-mysql"
check_service "mycloud-mongodb"
check_service "mycloud-redis"
check_service "mycloud-backend"

# Nginx does not have a native docker healthcheck in our current compose, check running state:
proxy_status=$(docker inspect --format='{{.State.Status}}' "mycloud-proxy" 2>/dev/null || echo "stopped")
if [ "$proxy_status" == "running" ]; then
  echo "[OK] mycloud-proxy is running."
else
  echo "[ERROR] mycloud-proxy is $proxy_status."
fi

echo "========================================"
