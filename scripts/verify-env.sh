#!/bin/bash

set -e

echo "🔍 Verifying environment variables..."

# Check for required environment variables
required_vars=(
  "JWT_SECRET"
  "USERS_DB_USER"
  "USERS_DB_PASSWORD"
  "MOVIES_DB_USER"
  "MOVIES_DB_PASSWORD"
  "RATINGS_DB_USER"
  "RATINGS_DB_PASSWORD"
  "WATCHLIST_DB_USER"
  "WATCHLIST_DB_PASSWORD"
  "NOTIFICATION_DB_USER"
  "NOTIFICATION_DB_PASSWORD"
  "CMS_DB_USER"
  "CMS_DB_PASSWORD"
  "RECOMMENDATIONS_DB_USER"
  "RECOMMENDATIONS_DB_PASSWORD"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please set these environment variables before running the services."
  echo "You can set them in a .env file or export them in your shell."
  exit 1
fi

echo "✅ All required environment variables are set!"
