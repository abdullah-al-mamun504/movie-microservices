# =========================
# Stage 1: Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory inside container
WORKDIR /src

# Copy only the .csproj first to leverage Docker cache
COPY ./src/user-service.csproj ./

# Restore dependencies
RUN dotnet restore "user-service.csproj"

# Copy all source code + migrations
COPY ./src/. ./
#COPY ./migrations ./migrations

# Build the project in Release configuration
RUN dotnet build "user-service.csproj" -c Release -o /app/build

# =========================
# Stage 2: Publish
# =========================
FROM build AS publish

RUN dotnet publish "user-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

# =========================
# Stage 3: Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Copy published output from the previous stage
COPY --from=publish /app/publish ./

# Entry point
ENTRYPOINT ["dotnet", "user-service.dll"]

