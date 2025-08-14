package database

import (
    "database/sql"
    "fmt"
    "movie-microservices/notification-service/internal/config"

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
    // Create notifications table
    if _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            status VARCHAR(50) DEFAULT 'pending',
            channel VARCHAR(50) DEFAULT 'email',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            sent_at TIMESTAMP WITH TIME ZONE,
            read_at TIMESTAMP WITH TIME ZONE
        );
    `); err != nil {
        return fmt.Errorf("failed to create notifications table: %w", err)
    }

    // Create templates table
    if _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            subject VARCHAR(255),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, type)
        );
    `); err != nil {
        return fmt.Errorf("failed to create templates table: %w", err)
    }

    // Create preferences table
    if _, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS preferences (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            email_enabled BOOLEAN DEFAULT true,
            push_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id)
        );
    `); err != nil {
        return fmt.Errorf("failed to create preferences table: %w", err)
    }

    // Create indexes
    if _, err := db.Exec(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `); err != nil {
        return fmt.Errorf("failed to create notifications user_id index: %w", err)
    }

    if _, err := db.Exec(`
        CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
    `); err != nil {
        return fmt.Errorf("failed to create notifications status index: %w", err)
    }

    // Insert default templates
    if _, err := db.Exec(`
        INSERT INTO templates (name, type, subject, content) VALUES
        ('movie_recommendation', 'email', 'New Movie Recommendation', 'Hi {{.Username}}, we have a new movie recommendation for you: {{.MovieTitle}}'),
        ('watchlist_reminder', 'email', 'Movies in Your Watchlist', 'Hi {{.Username}}, you have {{.Count}} movies in your watchlist. Why not watch one tonight?'),
        ('new_release', 'email', 'New Movie Release', 'Hi {{.Username}}, a new movie "{{.MovieTitle}}" has been released that you might like.'),
        ('rating_reminder', 'email', 'Rate Your Watched Movies', 'Hi {{.Username}}, you recently watched "{{.MovieTitle}}". Would you like to rate it?')
        ON CONFLICT (name, type) DO NOTHING;
    `); err != nil {
        return fmt.Errorf("failed to insert default templates: %w", err)
    }

    return nil
}
