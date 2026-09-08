#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

BACKUP_DIR="/opt/mycloud/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_DIR="$BACKUP_DIR/$TIMESTAMP"
SECRETS_DIR="/etc/mycloud/secrets"
CONFIG_DIR="/etc/mycloud/config"

mkdir -p "$TARGET_DIR"

echo "[INFO] Starting Backup at $TARGET_DIR"

if [ ! -d "$SECRETS_DIR" ]; then
    echo "[ERROR] Secrets directory not found. Is MyCloud installed?"
    exit 1
fi

MYSQL_PASSWORD=$(cat "$SECRETS_DIR/mysql_password")
MONGODB_PASSWORD=$(cat "$SECRETS_DIR/mongodb_password")

echo "[1/5] Dumping MySQL database..."
docker compose exec -T mysql mysqldump -u mycloud -p"$MYSQL_PASSWORD" mycloud > "$TARGET_DIR/mysql.sql"

echo "[2/5] Dumping MongoDB database..."
docker compose exec -T mongodb mongodump --username=mycloud --password="$MONGODB_PASSWORD" --authenticationDatabase=admin --db=mycloud --archive > "$TARGET_DIR/mongodb.archive"

echo "[3/5] Backing up secrets & config (ENCRYPTED / RESTRICTED)..."
tar -czf "$TARGET_DIR/secrets_and_config.tar.gz" -C /etc/mycloud secrets config
chmod 600 "$TARGET_DIR/secrets_and_config.tar.gz"

echo "[4/5] Creating tarball of physical storage..."
tar -czf "$TARGET_DIR/storage.tar.gz" -C /opt/mycloud storage

echo "[5/5] Generating manifest.json..."
cat <<MANIFEST > "$TARGET_DIR/manifest.json"
{
  "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "2.0.0",
  "services": ["mysql", "mongodb", "storage", "secrets"],
  "status": "success"
}
MANIFEST

echo "[SUCCESS] Backup completed successfully!"
