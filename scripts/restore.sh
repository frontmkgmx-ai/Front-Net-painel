#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

if [ -z "${1-}" ]; then
  echo "[ERROR] Usage: ./scripts/restore.sh <path_to_backup_dir>"
  exit 1
fi
BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "[ERROR] Backup directory $BACKUP_DIR does not exist."
  exit 1
fi

if [ ! -f "$BACKUP_DIR/manifest.json" ]; then
  echo "[WARNING] No manifest.json found in backup directory."
else
  echo "--- Backup Details ---"
  cat "$BACKUP_DIR/manifest.json"
  echo "----------------------"
fi

echo "======================================================================="
echo "                             WARNING"
echo "======================================================================="
echo "You are about to restore from backup: $BACKUP_DIR"
echo "This operation will OVERWRITE your current databases, storage, and SECRETS."
echo "======================================================================="
read -p "Are you sure you want to proceed? (Type 'YES' to confirm): " confirm
if [ "$confirm" != "YES" ]; then
  echo "Restore aborted."
  exit 0
fi

echo "[INFO] Restoring secrets and configuration..."
tar -xzf "$BACKUP_DIR/secrets_and_config.tar.gz" -C /etc/mycloud
chmod 700 /etc/mycloud/secrets
chmod 600 /etc/mycloud/secrets/*

MYSQL_PASSWORD=$(cat /etc/mycloud/secrets/mysql_password)
MONGODB_PASSWORD=$(cat /etc/mycloud/secrets/mongodb_password)

echo "[INFO] Restoring MySQL database..."
cat "$BACKUP_DIR/mysql.sql" | docker compose exec -T mysql mysql -u mycloud -p"$MYSQL_PASSWORD" mycloud

echo "[INFO] Restoring MongoDB database..."
cat "$BACKUP_DIR/mongodb.archive" | docker compose exec -T mongodb mongorestore --archive --drop

echo "[INFO] Restoring storage files..."
tar -xzf "$BACKUP_DIR/storage.tar.gz" -C /opt/mycloud

echo "[SUCCESS] Restore completed successfully!"
