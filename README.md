# Movie Microservices

A comprehensive microservices architecture for a movie recommendation platform, built with various technologies including .NET, Node.js, Python, and Go.

## Architecture Overview

The application is composed of the following microservices:

1. **API Gateway** (.NET 9) - Handles authentication, routing, and rate limiting
2. **User Service** (.NET 9) - Manages user authentication and profiles
3. **Movie Service** (Node.js/Express) - Manages movie data and integrates with TMDB API
4. **Recommendation Service** (Python/FastAPI) - Provides movie recommendations based on user preferences
5. **Rating Service** (Node.js/Express) - Handles movie ratings and comments
6. **Watchlist Service** (Go) - Manages user watchlists and viewing history
7. **Notification Service** (Go) - Handles email and push notifications
8. **CMS Service** (.NET 9) - Manages CMS data like countries, languages, genres, and poster uploads
9. **Frontend** (React) - User interface for the application

## Features

- User authentication and authorization
- Movie browsing and search
- Personalized movie recommendations
- Movie ratings and reviews
- Watchlist management
- Notification system
- CMS for managing countries, languages, and genres
- Movie poster uploads with local storage (MinIO compatible)

## Local Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)
- .NET 9 SDK (for .NET service development)
- Go 1.21+ (for Go service development)
- Python 3.11+ (for Python service development)


######IMPORTANT NOTES###############

Since This project is inside a movie-microservices directory and imports expect that path, update  go.mod file:

# Navigate to watchlist-service directory
cd watchlist-service

# Update the module name to match your import paths
docker run --rm -v $(pwd):/app -w /app golang:1.21-alpine go mod edit -module=movie-microservices/watchlist-service

# Run go mod tidy to update dependencies
docker run --rm -v $(pwd):/app -w /app golang:1.21-alpine go mod tidy

# Now build your Docker image
docker build -t watchlist-service .


### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env

# === JWT CONFIG ===
JWT_SECRET=f7b9c8d124e3a5f6829d0e3c1b4f67a9d2e58c1f7a6b3d09e8f2c5a4b1d7e9f3

# === USERS DATABASE ===
USERS_DB_NAME=users_db
USERS_DB_USER=users_admin
USERS_DB_PASSWORD=users_secure_password_123
USERS_DB_PORT=5432

# === MOVIES DATABASE ===
MOVIES_DB_NAME=movies_db
MOVIES_DB_USER=movies_admin
MOVIES_DB_PASSWORD=movies_secure_password_456
MOVIES_DB_PORT=5433

# === RATINGS DATABASE ===
RATINGS_DB_NAME=ratings_db
RATINGS_DB_USER=ratings_admin
RATINGS_DB_PASSWORD=ratings_secure_password_789
RATINGS_DB_PORT=5434

# === WATCHLIST DATABASE ===
WATCHLIST_DB_NAME=watchlist_db
WATCHLIST_DB_USER=watchlist_admin
WATCHLIST_DB_PASSWORD=watchlist_secure_password_012
WATCHLIST_DB_PORT=5435

# === NOTIFICATION DATABASE ===
NOTIFICATION_DB_NAME=notification_db
NOTIFICATION_DB_USER=notification_admin
NOTIFICATION_DB_PASSWORD=notification_secure_password_345
NOTIFICATION_DB_PORT=5436

# === CMS DATABASE ===
CMS_DB_NAME=cms_db
CMS_DB_USER=cms_admin
CMS_DB_PASSWORD=cms_secure_password_678
CMS_DB_PORT=5437

# === RECOMMENDATIONS DATABASE ===
RECOMMENDATIONS_DB_NAME=recommendations_db
RECOMMENDATIONS_DB_USER=recommendations_admin
RECOMMENDATIONS_DB_PASSWORD=recommendations_secure_password_012
RECOMMENDATIONS_DB_PORT=5438

# === REDIS ===
REDIS_URL=redis://redis:6379

# === TMDB API ===
TMDB_API_KEY=your_tmdb_api_key_here

# === EMAIL SERVICE ===
SENDGRID_API_KEY=your_sendgrid_api_key_here

# === PUSH NOTIFICATIONS ===
FCM_API_KEY=your_fcm_api_key_here
FCM_AUTH_TOKEN=your_fcm_auth_token_here

# === BCRYPT ===
BCRYPT_ROUNDS=8

# === LOGGING ===
NODE_ENV=development
LOG_LEVEL=info
```


# Movie Microservices API Documentation

This document contains all API endpoints for the Movie Microservices project, along with example `curl` commands.

---

## CMS Service (Port: 8081)

| HTTP Method | Endpoint           | Description       | Example curl |
|------------|------------------|-----------------|--------------|
| GET        | /api/countries     | Get all countries | `curl http://localhost:8081/api/countries` |
| GET        | /api/genres        | Get all genres    | `curl http://localhost:8081/api/genres` |
| GET        | /api/languages     | Get all languages | `curl http://localhost:8081/api/languages` |
| GET        | /api/posters       | Get all posters   | `curl http://localhost:8081/api/posters` |
| POST       | /api/countries     | Add country       | `curl -X POST http://localhost:8081/api/countries -H "Content-Type: application/json" -d '{"name":"USA"}'` |
| POST       | /api/genres        | Add genre         | `curl -X POST http://localhost:8081/api/genres -H "Content-Type: application/json" -d '{"name":"Action"}'` |
| POST       | /api/languages     | Add language      | `curl -X POST http://localhost:8081/api/languages -H "Content-Type: application/json" -d '{"name":"English"}'` |
| POST       | /api/posters       | Upload poster     | `curl -X POST http://localhost:8081/api/posters -F "file=@/path/to/poster.jpg"` |

---

## Movie Service (Port: 3001)

| HTTP Method | Endpoint                 | Description      | Example curl |
|------------|--------------------------|-----------------|--------------|
| GET        | /api/movies              | Get all movies   | `curl http://localhost:3001/api/movies` |
| GET        | /api/movies/{id}         | Get movie by ID  | `curl http://localhost:3001/api/movies/1` |
| POST       | /api/movies              | Add movie        | `curl -X POST http://localhost:3001/api/movies -H "Content-Type: application/json" -d '{"title":"Inception","year":2010}'` |
| GET        | /api/movies/search       | Search movies    | `curl http://localhost:3001/api/movies/search?query=Inception` |
| GET        | /api/movies/popular      | Popular movies   | `curl http://localhost:3001/api/movies/popular` |
| GET        | /api/movies/top-rated    | Top rated movies | `curl http://localhost:3001/api/movies/top-rated` |
| GET        | /api/movies/upcoming     | Upcoming movies  | `curl http://localhost:3001/api/movies/upcoming` |

---

## Rating Service (Port: 3002)

| HTTP Method | Endpoint              | Description       | Example curl |
|------------|---------------------|-----------------|--------------|
| GET        | /api/ratings         | Get all ratings  | `curl http://localhost:3002/api/ratings` |
| GET        | /api/ratings/{id}    | Get rating by ID | `curl http://localhost:3002/api/ratings/1` |
| POST       | /api/ratings         | Add rating       | `curl -X POST http://localhost:3002/api/ratings -H "Content-Type: application/json" -d '{"movieId":1,"userId":1,"score":5}'` |

---

## User Service (Port: 8082)

| HTTP Method | Endpoint                 | Description  | Example curl |
|------------|--------------------------|------------|--------------|
| POST       | /api/auth/register       | User signup | `curl -X POST http://localhost:8082/api/auth/register -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"123"}'` |
| POST       | /api/auth/login          | User login  | `curl -X POST http://localhost:8082/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"123"}'` |
| GET        | /api/users               | Get all users | `curl http://localhost:8082/api/users` |
| GET        | /api/users/{id}          | Get user by ID | `curl http://localhost:8082/api/users/1` |

---

## Watchlist Service (Port: 3003)

| HTTP Method | Endpoint                  | Description          | Example curl |
|------------|---------------------------|-------------------|--------------|
| GET        | /api/watchlist             | Get all watchlist items | `curl http://localhost:3003/api/watchlist` |
| GET        | /api/watchlist/{userId}    | Get watchlist by user   | `curl http://localhost:3003/api/watchlist/1` |
| POST       | /api/watchlist             | Add movie to watchlist  | `curl -X POST http://localhost:3003/api/watchlist -H "Content-Type: application/json" -d '{"userId":1,"movieId":1}'` |
| DELETE     | /api/watchlist/{id}        | Remove movie from watchlist | `curl -X DELETE http://localhost:3003/api/watchlist/1` |

---

## Recommendation Service (Port: 8000)

| HTTP Method | Endpoint                    | Description               | Example curl |
|------------|-----------------------------|--------------------------|--------------|
| GET        | /recommendations             | Get all recommendations   | `curl http://localhost:8000/recommendations` |
| GET        | /recommendations/{userId}    | Get recommendations for user | `curl http://localhost:8000/recommendations/1` |
| POST       | /recommendations             | Add recommendation        | `curl -X POST http://localhost:8000/recommendations -H "Content-Type: application/json" -d '{"userId":1,"movieId":1}'` |

---

## API Gateway (Port: 8080)

| HTTP Method | Endpoint             | Description          | Example curl |
|------------|--------------------|--------------------|--------------|
| GET        | /cms/countries      | Proxy to CMS countries | `curl http://localhost:8080/cms/countries` |
| GET        | /movies/popular     | Proxy to popular movies | `curl http://localhost:8080/movies/popular` |
| POST       | /users/login        | Proxy to user login | `curl -X POST http://localhost:8080/users/login -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"123"}'` |
| GET        | /watchlist/1        | Proxy to watchlist by user | `curl http://localhost:8080/watchlist/1` |

---









