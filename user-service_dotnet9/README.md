# User Service

## Overview
The User Service is responsible for user authentication, registration, and profile management.

## Features
- User registration and authentication
- JWT token generation
- User profile management
- Password hashing and validation

## Environment Variables
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string
- `Jwt__Key`: JWT signing key
- `Jwt__Issuer`: JWT issuer
- `Jwt__Audience`: JWT audience
- `Jwt__ExpirationMinutes`: JWT token expiration time in minutes

## Running the Service
```bash
dotnet run
