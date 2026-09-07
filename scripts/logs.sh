#!/bin/bash
set -euo pipefail
if [ -z "${1-}" ]; then
  echo "Usage: ./scripts/logs.sh [service_name] (e.g., backend, frontend, mysql)"
  docker compose logs -f --tail=100
else
  docker compose logs -f --tail=100 "$1"
fi
