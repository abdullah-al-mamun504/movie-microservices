# Rating Service

## Overview
The Rating Service is responsible for managing movie ratings and comments.

## Features
- Movie rating (1-10 stars)
- Comments on movies
- Rating moderation
- Average rating calculation
- Redis caching for improved performance

## Environment Variables
- `PORT`: Port for the service to run on (default: 3002)
- `RATINGS_DB_NAME`: Database name (default: ratings_db)
- `RATINGS_DB_USER`: Database username (default: ratings_admin)
- `RATINGS_DB_PASSWORD`: Database password
- `RATINGS_DB_HOST`: Database host (default: ratings-db)
- `RATINGS_DB_PORT_INTERNAL`: Database port (default: 5432)
- `REDIS_URL`: Redis connection URL (default: redis://redis:6379)
- `JWT_SECRET`: JWT secret key for authentication
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level

## Running the Service
```bash
npm install
npm start
