package database

import (
    "database/sql"
    "fmt"
    "movie-microservices/watchlist-service/internal/config"

    _ "github.com/lib/pq"
)

func Connect(cfg config.DatabaseConfig) (*sql.DB, error) {
    connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode)

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, fmt.Errorf("failed to open database: %w", err)
    }

    // Check connection
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }

    return db, nil
}

func RunMigrations(db *sql.DB) error {
    // Create watchlists table
    if _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS watchlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, movie_id)
        );
    `); err != nil {
        return fmt.Errorf("failed to create watchlists table: %w", err)
    }

    // Create history table
    if _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            action VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `); err != nil {
        return fmt.Errorf("failed to create history table: %w", err)
    }

    // Create indexes
    if _, err := db.Exec(`
        CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
    `); err != nil {
        return fmt.Errorf("failed to create watchlists user_id index: %w", err)
    }

    if _, err := db.Exec(`
        CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
    `); err != nil {
        return fmt.Errorf("failed to create history user_id index: %w", err)
    }

    return nil
}
