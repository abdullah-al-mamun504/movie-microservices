#!/bin/bash

set -e

echo "🔧 Fixing file permissions..."

# Get the UID/GID of the current user
CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)

echo "👤 Current user UID: $CURRENT_UID"
echo "👥 Current user GID: $CURRENT_GID"

# Fix permissions for movie-service logs
if [ -d "./movie-service/logs" ]; then
  echo "🔧 Fixing permissions for movie-service logs..."
  sudo chown -R $CURRENT_UID:$CURRENT_GID ./movie-service/logs
fi

# Fix permissions for rating-service logs
if [ -d "./rating-service/logs" ]; then
  echo "🔧 Fixing permissions for rating-service logs..."
  sudo chown -R $CURRENT_UID:$CURRENT_GID ./rating-service/logs
fi

# Fix permissions for cms-service uploads
if [ -d "./cms-service/uploads" ]; then
  echo "🔧 Fixing permissions for cms-service uploads..."
  sudo chown -R $CURRENT_UID:$CURRENT_GID ./cms-service/uploads
fi

# Fix permissions for docker volumes
echo "🔧 Fixing permissions for Docker volumes..."
sudo chown -R $CURRENT_UID:$CURRENT_GID ./data

echo "✅ File permissions fixed!"
