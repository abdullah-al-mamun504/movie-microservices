package redis

import (
    "context"
    "movie-microservices/notification-service/internal/config"
    "time"

    "github.com/go-redis/redis/v8"
    "github.com/rs/zerolog/log"
)

func Connect(cfg config.RedisConfig) *redis.Client {
    rdb := redis.NewClient(&redis.Options{
        Addr:     cfg.Host + ":" + cfg.Port,
        Password: cfg.Password,
        DB:       cfg.DB,
    })

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Test connection
    _, err := rdb.Ping(ctx).Result()
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to connect to Redis")
    }

    log.Info().Msg("Connected to Redis")
    return rdb
}
