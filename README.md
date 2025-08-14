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







