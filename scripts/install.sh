#!/bin/bash
set -euo pipefail

echo "========================================"
echo "   MyCloud Panel - Install Script"
echo "========================================"

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

ARCH=$(uname -m)
echo "[INFO] Detected Architecture: $ARCH"

echo "[INFO] Checking dependencies..."
for pkg in curl git openssl; do
  if ! command -v $pkg &> /dev/null; then
    echo "[INFO] Installing $pkg..."
    apt-get update && apt-get install -y $pkg
  fi
done

if ! command -v docker &> /dev/null; then
  echo "[INFO] Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
fi

echo "[INFO] Creating directory structure..."
mkdir -p /opt/mycloud/{app,data/mysql,data/mongodb,data/redis,storage,backups,logs,config}
chmod -R 755 /opt/mycloud
chmod +x scripts/*.sh

if [ ! -f .env ]; then
  echo "[INFO] Generating secure .env file..."
  cp .env.example .env
  
  # Generate secure secrets
  sed -i "s/^ADMIN_INITIAL_PASSWORD=.*/ADMIN_INITIAL_PASSWORD=$(openssl rand -hex 12)/" .env
  sed -i "s/^MYSQL_ROOT_PASSWORD=.*/MYSQL_ROOT_PASSWORD=$(openssl rand -hex 16)/" .env
  sed -i "s/^MYSQL_PASSWORD=.*/MYSQL_PASSWORD=$(openssl rand -hex 16)/" .env
  sed -i "s/^MONGODB_PASSWORD=.*/MONGODB_PASSWORD=$(openssl rand -hex 16)/" .env
  sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$(openssl rand -hex 16)/" .env
  sed -i "s/^SESSION_SECRET=.*/SESSION_SECRET=$(openssl rand -base64 32)/" .env
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -base64 32)/" .env
else
  echo "[INFO] .env file already exists. Skipping secret generation to preserve existing data."
fi

echo "[INFO] Starting Docker containers..."
docker compose up -d --build

echo "[INFO] Waiting for databases to become healthy (30s)..."
sleep 30

echo "[INFO] Running database migrations..."
./scripts/migrate.sh

echo "========================================"
echo "[SUCCESS] Installation Complete!"
echo "========================================"
echo "Your initial admin credentials are in the .env file."
grep "ADMIN_INITIAL_" .env
echo "========================================"
echo "Useful commands:"
echo "  sudo ./scripts/status.sh"
echo "  sudo ./scripts/logs.sh"
echo "========================================"
