#!/bin/bash
set -euo pipefail

echo "========================================"
echo "   MyCloud Panel - Enterprise v3.0 Installer"
echo "   (Docker Secrets & Config Architecture)"
echo "========================================"

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

ARCH=$(uname -m)
OS=$(grep -E '^(ID|VERSION_ID)=' /etc/os-release | tr '\n' ' ' 2>/dev/null || echo "Unknown")
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

SECRETS_DIR="/etc/mycloud/secrets"
CONFIG_DIR="/etc/mycloud/config"
mkdir -p "$SECRETS_DIR" "$CONFIG_DIR"
chmod 700 /etc/mycloud "$SECRETS_DIR" "$CONFIG_DIR"

if [ -f .env ]; then
  echo "[INFO] Migrating old .env to secure secrets architecture..."
  source .env || true
  
  echo -n "${MYSQL_ROOT_PASSWORD:-$(openssl rand -hex 16)}" > "$SECRETS_DIR/mysql_root_password"
  echo -n "${MYSQL_PASSWORD:-$(openssl rand -hex 16)}" > "$SECRETS_DIR/mysql_password"
  echo -n "${MONGODB_PASSWORD:-$(openssl rand -hex 16)}" > "$SECRETS_DIR/mongodb_password"
  echo -n "${REDIS_PASSWORD:-$(openssl rand -hex 16)}" > "$SECRETS_DIR/redis_password"
  echo -n "${JWT_SECRET:-$(openssl rand -hex 32)}" > "$SECRETS_DIR/jwt_secret"
  echo -n "${SESSION_SECRET:-$(openssl rand -hex 32)}" > "$SECRETS_DIR/session_secret"
  echo -n "${ADMIN_INITIAL_PASSWORD:-$(openssl rand -hex 12)}" > "$SECRETS_DIR/admin_initial_password"
  
  echo "DOMAIN=${DOMAIN:-mycloud.local}" > "$CONFIG_DIR/mycloud.conf"
  echo "ADMIN_USERNAME=${ADMIN_INITIAL_USERNAME:-admin}" >> "$CONFIG_DIR/mycloud.conf"
  
  mv .env .env.bak
  echo "[INFO] Old .env backed up to .env.bak and removed."
else
  echo "[INFO] Generating secure Docker Secrets..."
  [ -f "$SECRETS_DIR/mysql_root_password" ] || openssl rand -hex 16 > "$SECRETS_DIR/mysql_root_password"
  [ -f "$SECRETS_DIR/mysql_password" ] || openssl rand -hex 16 > "$SECRETS_DIR/mysql_password"
  [ -f "$SECRETS_DIR/mongodb_password" ] || openssl rand -hex 16 > "$SECRETS_DIR/mongodb_password"
  [ -f "$SECRETS_DIR/redis_password" ] || openssl rand -hex 16 > "$SECRETS_DIR/redis_password"
  [ -f "$SECRETS_DIR/jwt_secret" ] || openssl rand -hex 32 > "$SECRETS_DIR/jwt_secret"
  [ -f "$SECRETS_DIR/session_secret" ] || openssl rand -hex 32 > "$SECRETS_DIR/session_secret"
  [ -f "$SECRETS_DIR/admin_initial_password" ] || openssl rand -hex 12 > "$SECRETS_DIR/admin_initial_password"

  if [ ! -f "$CONFIG_DIR/mycloud.conf" ]; then
    echo "DOMAIN=mycloud.local" > "$CONFIG_DIR/mycloud.conf"
    echo "ADMIN_USERNAME=admin" >> "$CONFIG_DIR/mycloud.conf"
  fi
fi

chmod 600 "$SECRETS_DIR"/*

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
echo "Your initial admin password has been securely generated."
echo "Username: \$(grep ADMIN_USERNAME $CONFIG_DIR/mycloud.conf | cut -d'=' -f2)"
echo "Password: \$(cat $SECRETS_DIR/admin_initial_password)"
echo "========================================"
echo "Useful commands:"
echo "  sudo ./scripts/status.sh"
echo "  sudo ./scripts/doctor.sh"
echo "  sudo ./scripts/logs.sh"
echo "========================================"
