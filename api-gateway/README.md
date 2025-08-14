# API Gateway Service

## Overview
The API Gateway is the single entry point for all client requests. It handles authentication, routing, rate limiting, and forwards requests to the appropriate microservices.

## Features
- JWT Authentication
- Request routing to microservices
- Rate limiting
- CORS support
- Request/response logging

## Environment Variables
- `Jwt__Key`: JWT signing key
- `Jwt__Issuer`: JWT issuer
- `Jwt__Audience`: JWT audience
- `Services__UserService`: URL of the User Service
- `Services__MovieService`: URL of the Movie Service
- `Services__RecommendationService`: URL of the Recommendation Service
- `Services__RatingService`: URL of the Rating Service
- `Services__WatchlistService`: URL of the Watchlist Service
- `Services__NotificationService`: URL of the Notification Service
- `Services__CmsService`: URL of the CMS Service

## Running the Service
```bash
dotnet run
