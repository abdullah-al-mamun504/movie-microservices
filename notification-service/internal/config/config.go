package config

import (
    "fmt"
    "github.com/spf13/viper"
)

type Config struct {
    Port       string
    Environment string
    Database   DatabaseConfig
    Redis      RedisConfig
    JWT        JWTConfig
    Email      EmailConfig
    Push       PushConfig
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

type RedisConfig struct {
    Host     string
    Port     string
    Password string
    DB       int
}

type JWTConfig struct {
    Secret string
}

type EmailConfig struct {
    Provider   string
    APIKey     string
    FromEmail  string
    FromName   string
}

type PushConfig struct {
    Provider   string
    APIKey     string
    AuthToken  string
}

func LoadConfig() (*Config, error) {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath(".")
    viper.AddConfigPath("./config")
    viper.AddConfigPath("/etc/notification-service")

    // Set default values
    viper.SetDefault("port", "3004")
    viper.SetDefault("environment", "development")
    viper.SetDefault("database.host", "notification-db")
    viper.SetDefault("database.port", "5432")
    viper.SetDefault("database.user", "notification_admin")
    viper.SetDefault("database.password", "notification_secure_password_345")
    viper.SetDefault("database.dbname", "notification_db")
    viper.SetDefault("database.sslmode", "disable")
    viper.SetDefault("redis.host", "redis")
    viper.SetDefault("redis.port", "6379")
    viper.SetDefault("redis.password", "")
    viper.SetDefault("redis.db", 0)
    viper.SetDefault("jwt.secret", "notification_jwt_secret")
    viper.SetDefault("email.provider", "sendgrid")
    viper.SetDefault("email.from_email", "noreply@movie-microservices.com")
    viper.SetDefault("email.from_name", "Movie Microservices")
    viper.SetDefault("push.provider", "fcm")

    // Enable environment variable override
    viper.AutomaticEnv()

    // Read configuration
    if err := viper.ReadInConfig(); err != nil {
        if _, ok := err.(viper.ConfigFileNotFoundError); ok {
            // Config file not found; use defaults and environment variables
        } else {
            return nil, fmt.Errorf("error reading config file: %w", err)
        }
    }

    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("unable to decode config: %w", err)
    }

    return &cfg, nil
}
