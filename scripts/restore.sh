#!/bin/bash
set -euo pipefail
if [ -z "${1-}" ]; then
  echo "[ERROR] Usage: ./scripts/restore.sh <path_to_backup_dir>"
  exit 1
fi

BACKUP_DIR="$1"
if [ ! -d "$BACKUP_DIR" ]; then
  echo "[ERROR] Backup directory $BACKUP_DIR does not exist."
  exit 1
fi

echo "======================================================================="
echo "                             WARNING"
echo "======================================================================="
echo "You are about to restore from backup: $BACKUP_DIR"
echo "This operation will OVERWRITE your current databases and storage."
echo "======================================================================="
read -p "Are you sure you want to proceed? (Type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
  echo "Restore aborted."
  exit 0
fi

echo "[INFO] Restoring MySQL database..."
source .env
cat "$BACKUP_DIR/mysql.sql" | docker compose exec -T mysql mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"

echo "[INFO] Restoring MongoDB database..."
cat "$BACKUP_DIR/mongodb.archive" | docker compose exec -T mongodb mongorestore --archive --drop

echo "[INFO] Restoring storage files..."
tar -xzf "$BACKUP_DIR/storage.tar.gz" -C /opt/mycloud

echo "[SUCCESS] Restore completed successfully!"
