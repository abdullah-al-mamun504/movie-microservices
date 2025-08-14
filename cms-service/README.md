# CMS Service

## Overview
The CMS Service is responsible for managing CMS data such as countries, languages, genres, and movie poster uploads.

## Features
- Country management
- Language management
- Genre management
- Movie poster uploads with local storage
- Future MinIO compatibility

## Environment Variables
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string
- `Jwt__Key`: JWT signing key
- `Jwt__Issuer`: JWT issuer
- `Jwt__Audience`: JWT audience
- `FileUpload__MaxFileSize`: Maximum file size for uploads (default: 5242880)
- `FileUpload__AllowedExtensions`: Allowed file extensions (default: .jpg, .jpeg, .png, .gif)
- `FileUpload__UploadPath`: Upload path (default: uploads)
- `Storage__Provider`: Storage provider (default: local)
- `Storage__LocalPath`: Local storage path (default: /app/uploads)
- `Storage__S3__Bucket`: S3 bucket name
- `Storage__S3__Region`: S3 region
- `Storage__S3__AccessKey`: S3 access key
- `Storage__S3__SecretKey`: S3 secret key

## Running the Service
```bash
dotnet run
