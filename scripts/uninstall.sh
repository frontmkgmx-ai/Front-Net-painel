#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

echo "======================================================================="
echo "                    MYCLOUD PANEL - UNINSTALLER"
echo "======================================================================="
echo "WARNING: This action is DESTRUCTIVE."
echo "If you proceed, all containers, networks, and images will be removed."
echo ""
echo "You will be asked separately if you want to wipe physical data (databases, storage, secrets)."
echo "======================================================================="
read -p "Type 'UNINSTALL' to remove the application containers: " confirm
if [ "$confirm" != "UNINSTALL" ]; then
    echo "Uninstallation aborted."
    exit 0
fi

echo "[INFO] Bringing down Docker Compose stack..."
docker compose down --rmi all --volumes --remove-orphans || true

echo "======================================================================="
echo "                      DANGER: DATA WIPE"
echo "======================================================================="
echo "Do you also want to completely delete all physical data?"
echo "This includes:"
echo " - /opt/mycloud (MySQL, MongoDB, Redis, Storage, Backups)"
echo " - /etc/mycloud (Cryptographic Secrets, JWT keys, Passwords)"
echo "======================================================================="
read -p "Type 'WIPE' to delete all physical data, or press Enter to keep it: " wipe_confirm
if [ "$wipe_confirm" == "WIPE" ]; then
    echo "[INFO] Wiping physical volumes and secrets..."
    rm -rf /opt/mycloud
    rm -rf /etc/mycloud
    echo "[SUCCESS] All data has been securely wiped."
else
    echo "[INFO] Physical data in /opt/mycloud and /etc/mycloud was KEPT."
fi

echo "[SUCCESS] Uninstallation completed."
