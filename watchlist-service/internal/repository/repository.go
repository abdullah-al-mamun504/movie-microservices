package repository

import (
    "database/sql"
    "movie-microservices/watchlist-service/internal/models"
)

type WatchlistRepository interface {
    GetByUserID(userID int) ([]*models.WatchlistItem, error)
    Add(userID, movieID int) (*models.WatchlistItem, error)
    Remove(userID, movieID int) error
    Exists(userID, movieID int) (bool, error)
}

type HistoryRepository interface {
    GetByUserID(userID int) ([]*models.HistoryItem, error)
    Add(userID, movieID int, action string) (*models.HistoryItem, error)
    Remove(userID, movieID int) error
}

type watchlistRepository struct {
    db *sql.DB
}

func NewWatchlistRepository(db *sql.DB) WatchlistRepository {
    return &watchlistRepository{db: db}
}

func (r *watchlistRepository) GetByUserID(userID int) ([]*models.WatchlistItem, error) {
    rows, err := r.db.Query(`
        SELECT id, user_id, movie_id, created_at
        FROM watchlists
        WHERE user_id = $1
        ORDER BY created_at DESC
    `, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var items []*models.WatchlistItem
    for rows.Next() {
        item := &models.WatchlistItem{}
        if err := rows.Scan(&item.ID, &item.UserID, &item.MovieID, &item.CreatedAt); err != nil {
            return nil, err
        }
        items = append(items, item)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return items, nil
}

func (r *watchlistRepository) Add(userID, movieID int) (*models.WatchlistItem, error) {
    var item models.WatchlistItem
    err := r.db.QueryRow(`
        INSERT INTO watchlists (user_id, movie_id)
        VALUES ($1, $2)
        RETURNING id, user_id, movie_id, created_at
    `, userID, movieID).Scan(&item.ID, &item.UserID, &item.MovieID, &item.CreatedAt)
    if err != nil {
        return nil, err
    }

    return &item, nil
}

func (r *watchlistRepository) Remove(userID, movieID int) error {
    _, err := r.db.Exec(`
        DELETE FROM watchlists
        WHERE user_id = $1 AND movie_id = $2
    `, userID, movieID)
    return err
}

func (r *watchlistRepository) Exists(userID, movieID int) (bool, error) {
    var exists bool
    err := r.db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM watchlists
            WHERE user_id = $1 AND movie_id = $2
        )
    `, userID, movieID).Scan(&exists)
    return exists, err
}

type historyRepository struct {
    db *sql.DB
}

func NewHistoryRepository(db *sql.DB) HistoryRepository {
    return &historyRepository{db: db}
}

func (r *historyRepository) GetByUserID(userID int) ([]*models.HistoryItem, error) {
    rows, err := r.db.Query(`
        SELECT id, user_id, movie_id, action, created_at
        FROM history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    `, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var items []*models.HistoryItem
    for rows.Next() {
        item := &models.HistoryItem{}
        if err := rows.Scan(&item.ID, &item.UserID, &item.MovieID, &item.Action, &item.CreatedAt); err != nil {
            return nil, err
        }
        items = append(items, item)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return items, nil
}

func (r *historyRepository) Add(userID, movieID int, action string) (*models.HistoryItem, error) {
    var item models.HistoryItem
    err := r.db.QueryRow(`
        INSERT INTO history (user_id, movie_id, action)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, movie_id, action, created_at
    `, userID, movieID, action).Scan(&item.ID, &item.UserID, &item.MovieID, &item.Action, &item.CreatedAt)
    if err != nil {
        return nil, err
    }

    return &item, nil
}

func (r *historyRepository) Remove(userID, movieID int) error {
    _, err := r.db.Exec(`
        DELETE FROM history
        WHERE user_id = $1 AND movie_id = $2
    `, userID, movieID)
    return err
}
