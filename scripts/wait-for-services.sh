#!/bin/bash

set -e

echo "⏳ Waiting for services to be healthy..."

# Function to check if a service is healthy
check_service_health() {
  local service_name=$1
  local url=$2
  local max_attempts=30
  local attempt=1

  echo "⏳ Checking health of $service_name..."
  
  while [ $attempt -le $max_attempts ]; do
    if curl -f -s "$url" > /dev/null; then
      echo "✅ $service_name is healthy!"
      return 0
    fi
    
    echo "⏳ Attempt $attempt/$max_attempts: $service_name is not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ $service_name failed to become healthy after $max_attempts attempts!"
  return 1
}

# Check health of all services
check_service_health "API Gateway" "http://localhost:8080/health"
check_service_health "User Service" "http://localhost:8081/health"
check_service_health "Movie Service" "http://localhost:3001/health"
check_service_health "Recommendation Service" "http://localhost:8000/health"
check_service_health "Rating Service" "http://localhost:3002/health"
check_service_health "Watchlist Service" "http://localhost:3003/health"
check_service_health "Notification Service" "http://localhost:3004/health"
check_service_health "CMS Service" "http://localhost:8081/health"

echo "✅ All services are healthy!"
