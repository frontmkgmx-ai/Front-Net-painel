#!/bin/bash
set -euo pipefail

echo "========================================"
echo "   MyCloud Panel - Enterprise v3.0 Installer"
echo "========================================"

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

ARCH=$(uname -m)
OS=$(grep -E '^(ID|VERSION_ID)=' /etc/os-release | tr '\n' ' ')
echo "[INFO] Detected OS: $OS"
echo "[INFO] Detected Architecture: $ARCH"

# Minimum RAM check
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 1500 ]; then
    echo "[WARNING] System has less than 2GB RAM (${TOTAL_RAM}MB detected). Performance may be degraded."
    read -p "Continue anyway? (y/N): " ram_confirm
    if [[ ! "$ram_confirm" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

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

# Ensure docker group exists and we add the current user if needed, but we run as root anyway
echo "[INFO] Starting Docker containers..."
docker compose pull
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
echo "  sudo ./scripts/doctor.sh"
echo "  sudo ./scripts/logs.sh"
echo "========================================"
