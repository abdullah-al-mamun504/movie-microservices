# ---------- BUILD STAGE ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["cms-service.csproj", "."]
RUN dotnet restore "./cms-service.csproj"

# Copy all source files
COPY . .
WORKDIR "/src"

# Build the project
RUN dotnet build "cms-service.csproj" -c Release -o /app/build

# ---------- PUBLISH STAGE ----------
FROM build AS publish
RUN dotnet publish "cms-service.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- FINAL IMAGE ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create uploads folder with appropriate permissions
RUN mkdir -p /app/uploads && chmod 755 /app/uploads

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the app
ENTRYPOINT ["dotnet", "cms-service.dll"]
