#!/bin/bash
set -euo pipefail
echo "======================================================================="
echo "                        UNINSTALL MYCLOUD PANEL"
echo "======================================================================="

read -p "Do you want to stop and remove containers and network? (y/n): " rm_containers
if [ "$rm_containers" == "y" ]; then
  docker compose down
  echo "[INFO] Containers removed."
fi

read -p "Do you want to remove Docker IMAGES? (y/n): " rm_images
if [ "$rm_images" == "y" ]; then
  docker rmi mycloud-frontend mycloud-backend --force 2>/dev/null || true
  echo "[INFO] Images removed."
fi

read -p "DANGEROUS: Do you want to DELETE ALL PERSISTENT DATA (/opt/mycloud)? (y/n): " rm_data
if [ "$rm_data" == "y" ]; then
  read -p "Are you absolutely sure? This will wipe databases, files, and backups! (Type 'DELETE'): " confirm_wipe
  if [ "$confirm_wipe" == "DELETE" ]; then
    rm -rf /opt/mycloud
    echo "[INFO] ALL DATA REMOVED."
  else
    echo "Data wipe aborted."
  fi
fi

echo "[INFO] Uninstall routine completed."
