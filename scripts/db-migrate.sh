#!/bin/bash

set -e

echo "🔄 Running database migrations..."

# Function to wait for database to be ready
wait_for_db() {
  local db_name=$1
  local db_host=$2
  local db_port=$3
  local db_user=$4
  local db_pass=$5
  
  echo "⏳ Waiting for $db_name database to be ready..."
  
  until pg_isready -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -t 1; do
    echo "⏳ Waiting for $db_name database..."
    sleep 1
  done
  
  echo "✅ $db_name database is ready!"
}

# Wait for all databases to be ready
wait_for_db "users_db" "users-db" "5432" "${USERS_DB_USER:-users_admin}" "${USERS_DB_PASSWORD:-users_secure_password_123}"
wait_for_db "movies_db" "movies-db" "5432" "${MOVIES_DB_USER:-movies_admin}" "${MOVIES_DB_PASSWORD:-movies_secure_password_456}"
wait_for_db "ratings_db" "ratings-db" "5432" "${RATINGS_DB_USER:-ratings_admin}" "${RATINGS_DB_PASSWORD:-ratings_secure_password_789}"
wait_for_db "watchlist_db" "watchlist-db" "5432" "${WATCHLIST_DB_USER:-watchlist_admin}" "${WATCHLIST_DB_PASSWORD:-watchlist_secure_password_012}"
wait_for_db "notification_db" "notification-db" "5432" "${NOTIFICATION_DB_USER:-notification_admin}" "${NOTIFICATION_DB_PASSWORD:-notification_secure_password_345}"
wait_for_db "cms_db" "cms-db" "5432" "${CMS_DB_USER:-cms_admin}" "${CMS_DB_PASSWORD:-cms_secure_password_678}"
wait_for_db "recommendations_db" "recommendations-db" "5432" "${RECOMMENDATIONS_DB_USER:-recommendations_admin}" "${RECOMMENDATIONS_DB_PASSWORD:-recommendations_secure_password_012}"

# Run migrations for each service
echo "🔄 Running User Service migrations..."
docker-compose exec user-service dotnet ef database update --context UserDbContext

echo "🔄 Running Movie Service migrations..."
docker-compose exec movie-service npm run migrate

echo "🔄 Running Rating Service migrations..."
docker-compose exec rating-service npm run migrate

echo "🔄 Running Watchlist Service migrations..."
docker-compose exec watchlist-service ./scripts/migrate.sh

echo "🔄 Running Notification Service migrations..."
docker-compose exec notification-service ./scripts/migrate.sh

echo "🔄 Running CMS Service migrations..."
docker-compose exec cms-service dotnet ef database update --context CmsDbContext

echo "🔄 Running Recommendation Service migrations..."
docker-compose exec recommendation-service python -m alembic upgrade head

echo "✅ All database migrations completed!"
