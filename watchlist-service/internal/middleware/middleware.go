package middleware

import (
    "movie-microservices/watchlist-service/internal/config"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/rs/zerolog/log"
)

// Logger logs all incoming HTTP requests
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery

        // Process request
        c.Next()

        // Log after processing
        end := time.Now()
        latency := end.Sub(start)
        clientIP := c.ClientIP()
        method := c.Request.Method
        statusCode := c.Writer.Status()
        bodySize := c.Writer.Size()

        if raw != "" {
            path = path + "?" + raw
        }

        log.Info().
            Str("client_ip", clientIP).
            Str("method", method).
            Str("path", path).
            Int("status", statusCode).
            Str("latency", latency.String()).
            Int("body_size", bodySize).
            Msg("HTTP request")
    }
}

// CORS handles cross-origin requests
func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}

// RateLimiter is a placeholder middleware for limiting requests per client.
// Currently, it does nothing. You can replace it with a real implementation later.
func RateLimiter() gin.HandlerFunc {
    return func(c *gin.Context) {
        // TODO: Add real rate limiting logic here
        c.Next()
    }
}



// Authenticate validates JWT token from the Authorization header
func Authenticate() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
            c.Abort()
            return
        }

        // Remove "Bearer " prefix if present
        if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
            tokenString = tokenString[7:]
        }

        // Load config to get JWT secret
        cfg, err := config.LoadConfig()
        if err != nil {
            log.Error().Err(err).Msg("Failed to load config")
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
            c.Abort()
            return
        }

        // Parse token
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return []byte(cfg.JWT.Secret), nil
        })

        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
            userID, ok := claims["sub"].(float64)
            if !ok {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
                c.Abort()
                return
            }
            c.Set("userID", int(userID))
            c.Next()
        } else {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
    }
}

