#!/bin/bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "[ERROR] This script must be run as root or with sudo."
  exit 1
fi

echo "======================================================================="
echo "                    MYCLOUD PANEL - DOCTOR"
echo "======================================================================="

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "[\033[32mPASS\033[0m] $2"
    else
        echo -e "[\033[31mFAIL\033[0m] $2"
        echo "       Action: $3"
    fi
}

echo "1. System Information:"
uname -a
echo ""

echo "2. Checking Docker..."
command -v docker &> /dev/null
check_status $? "Docker Installed" "Install Docker using install.sh"

echo "3. Checking Docker Compose..."
docker compose version &> /dev/null
check_status $? "Docker Compose V2 Installed" "Update Docker to V2"

echo "4. Checking Secure Architecture..."
[ -d /etc/mycloud/secrets ]
check_status $? "Secrets directory exists" "Run install.sh to generate secure infrastructure"

if [ -d /etc/mycloud/secrets ]; then
    [ -f /etc/mycloud/secrets/mysql_password ]
    check_status $? "MySQL password exists" "Regenerate missing secrets"
    [ -f /etc/mycloud/secrets/jwt_secret ]
    check_status $? "JWT Secret exists" "Regenerate missing secrets"
fi

[ ! -f .env ]
check_status $? "No legacy .env file found" "Legacy .env file exists. This should have been backed up during migration."

echo "5. Checking Storage Directories..."
[ -d /opt/mycloud/storage ]
check_status $? "/opt/mycloud/storage exists" "Run install.sh or create directory manually"
[ -w /opt/mycloud/storage ]
check_status $? "Storage is writable" "Fix permissions (chmod 755)"

echo "6. Checking Containers Health..."
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep mycloud || true
else
    echo "Docker not running."
fi

echo "======================================================================="
echo "Doctor check complete."
