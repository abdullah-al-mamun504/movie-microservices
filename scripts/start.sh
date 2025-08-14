#!/bin/bash

set -e

echo "🚀 Starting Movie Microservices..."

# Verify required environment variables
./scripts/verify-env.sh

# Create necessary directories
mkdir -p ./movie-service/logs
mkdir -p ./rating-service/logs
mkdir -p ./cms-service/uploads

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🏃 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
./scripts/wait-for-services.sh

echo "✅ All services are running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 API Gateway: http://localhost:8080"
echo ""
echo "📝 To view logs, run: docker-compose logs -f [service-name]"
echo "🛑 To stop services, run: docker-compose down"
