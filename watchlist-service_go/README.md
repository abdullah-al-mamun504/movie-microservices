# Watchlist Service

## Overview
The Watchlist Service is responsible for managing user watchlists and viewing history.

## Features
- Add/remove movies from watchlist
- Track viewing history
- Redis caching for improved performance

## Environment Variables
- `PORT`: Port for the service to run on (default: 3003)
- `ENVIRONMENT`: Environment (development/production)
- `DATABASE_HOST`: Database host (default: watchlist-db)
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_USER`: Database username (default: watchlist_admin)
- `DATABASE_PASSWORD`: Database password
- `DATABASE_DBNAME`: Database name (default: watchlist_db)
- `DATABASE_SSLMODE`: Database SSL mode (default: disable)
- `REDIS_HOST`: Redis host (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password
- `REDIS_DB`: Redis database number (default: 0)
- `JWT_SECRET`: JWT secret key for authentication

## Running the Service
```bash
go mod download
go run cmd/main.go
