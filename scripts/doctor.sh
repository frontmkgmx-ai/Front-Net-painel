#!/bin/bash
set -euo pipefail

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

echo "4. Checking .env file..."
[ -f .env ]
check_status $? ".env exists" "Copy .env.example or run install.sh"

if [ -f .env ]; then
    grep -q "ADMIN_INITIAL_PASSWORD" .env
    check_status $? "ADMIN_INITIAL_PASSWORD is set" "Set this in .env"
    grep -q "JWT_SECRET" .env
    check_status $? "JWT_SECRET is set" "Generate a secure secret in .env"
fi

echo "5. Checking Storage Directories..."
[ -d /opt/mycloud/storage ]
check_status $? "/opt/mycloud/storage exists" "Run install.sh or create directory manually"
[ -w /opt/mycloud/storage ]
check_status $? "Storage is writable" "Fix permissions (chmod 755)"

echo "6. Checking Containers Health..."
if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}" | grep mycloud
else
    echo "Docker not running."
fi

echo "======================================================================="
echo "Doctor check complete."
