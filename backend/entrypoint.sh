#!/bin/sh
set -e

# Load secrets into environment variables from Docker Secrets
export MYSQL_ROOT_PASSWORD=$(cat /run/secrets/mysql_root_password 2>/dev/null || echo "")
export MYSQL_PASSWORD=$(cat /run/secrets/mysql_password 2>/dev/null || echo "")
export MONGODB_PASSWORD=$(cat /run/secrets/mongodb_password 2>/dev/null || echo "")
export REDIS_PASSWORD=$(cat /run/secrets/redis_password 2>/dev/null || echo "")
export JWT_SECRET=$(cat /run/secrets/jwt_secret 2>/dev/null || echo "")
export SESSION_SECRET=$(cat /run/secrets/session_secret 2>/dev/null || echo "")
export ADMIN_INITIAL_PASSWORD=$(cat /run/secrets/admin_initial_password 2>/dev/null || echo "")

# Non-secrets from docker-compose environment or hardcoded internal names
export MYSQL_USER=${MYSQL_USER:-mycloud}
export MYSQL_DATABASE=${MYSQL_DATABASE:-mycloud}
export MYSQL_HOST=${MYSQL_HOST:-mysql}
export MYSQL_PORT=${MYSQL_PORT:-3306}

export MONGODB_USER=${MONGODB_USER:-mycloud}
export MONGODB_DATABASE=${MONGODB_DATABASE:-mycloud}
export MONGODB_HOST=${MONGODB_HOST:-mongodb}
export MONGODB_PORT=${MONGODB_PORT:-27017}

# Dynamic URLs
export DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}"
export MONGODB_URI="mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin"

# Execute the provided command
exec "$@"
