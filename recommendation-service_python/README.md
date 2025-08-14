# Recommendation Service

## Overview
The Recommendation Service provides movie recommendations based on user preferences and ratings.

## Features
- Personalized movie recommendations based on user ratings
- Similar movie recommendations
- Popular movie recommendations
- Redis caching for improved performance

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection URL (default: redis://redis:6379)
- `USER_SERVICE_URL`: URL of the User Service
- `MOVIE_SERVICE_URL`: URL of the Movie Service
- `RATING_SERVICE_URL`: URL of the Rating Service
- `LOG_LEVEL`: Logging level

## Running the Service
```bash
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
