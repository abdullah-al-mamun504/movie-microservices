# Notification Service

## Overview
The Notification Service is responsible for managing and sending notifications to users.

## Features
- Email notifications
- Push notifications
- Notification templates
- User preferences
- Notification history

## Environment Variables
- `PORT`: Port for the service to run on (default: 3004)
- `ENVIRONMENT`: Environment (development/production)
- `DATABASE_HOST`: Database host (default: notification-db)
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_USER`: Database username (default: notification_admin)
- `DATABASE_PASSWORD`: Database password
- `DATABASE_DBNAME`: Database name (default: notification_db)
- `DATABASE_SSLMODE`: Database SSL mode (default: disable)
- `REDIS_HOST`: Redis host (default: redis)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password
- `REDIS_DB`: Redis database number (default: 0)
- `JWT_SECRET`: JWT secret key for authentication
- `EMAIL_PROVIDER`: Email provider (default: sendgrid)
- `EMAIL_API_KEY`: Email API key
- `EMAIL_FROM_EMAIL`: From email address
- `EMAIL_FROM_NAME`: From name
- `PUSH_PROVIDER`: Push notification provider (default: fcm)
- `PUSH_API_KEY`: Push notification API key
- `PUSH_AUTH_TOKEN`: Push notification auth token

## Running the Service
```bash
go mod download
go run cmd/main.go
