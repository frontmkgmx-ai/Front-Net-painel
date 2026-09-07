#!/bin/bash
set -euo pipefail
BACKUP_DIR="/opt/mycloud/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_DIR="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$TARGET_DIR"

echo "[INFO] Starting Backup at $TARGET_DIR"

echo "[1/4] Dumping MySQL database..."
source .env
docker compose exec -T mysql mysqldump -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > "$TARGET_DIR/mysql.sql"

echo "[2/4] Dumping MongoDB database..."
docker compose exec -T mongodb mongodump --username="$MONGODB_USER" --password="$MONGODB_PASSWORD" --authenticationDatabase=admin --db="$MONGODB_DATABASE" --archive > "$TARGET_DIR/mongodb.archive"

echo "[3/4] Backing up environment file..."
cp .env "$TARGET_DIR/.env.backup"

echo "[4/4] Creating tarball of physical storage..."
tar -czf "$TARGET_DIR/storage.tar.gz" -C /opt/mycloud storage

echo "[SUCCESS] Backup completed successfully!"
