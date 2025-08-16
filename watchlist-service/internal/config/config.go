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

func LoadConfig() (*Config, error) {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath(".")
    viper.AddConfigPath("./config")
    viper.AddConfigPath("/etc/watchlist-service")

    // Set default values
    viper.SetDefault("port", "3003")
    viper.SetDefault("environment", "development")
    viper.SetDefault("database.host", "watchlist-db")
    viper.SetDefault("database.port", "5432")
    viper.SetDefault("database.user", "watchlist_admin")
    viper.SetDefault("database.password", "watchlist_secure_password_012")
    viper.SetDefault("database.dbname", "watchlist_db")
    viper.SetDefault("database.sslmode", "disable")
    viper.SetDefault("redis.host", "redis")
    viper.SetDefault("redis.port", "6379")
    viper.SetDefault("redis.password", "")
    viper.SetDefault("redis.db", 0)
    viper.SetDefault("jwt.secret", "watchlist_jwt_secret")

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
