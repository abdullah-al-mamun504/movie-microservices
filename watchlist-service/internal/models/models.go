package models

import "time"

type WatchlistItem struct {
    ID        int       `json:"id"`
    UserID    int       `json:"userId"`
    MovieID   int       `json:"movieId"`
    CreatedAt time.Time `json:"createdAt"`
}

type HistoryItem struct {
    ID        int       `json:"id"`
    UserID    int       `json:"userId"`
    MovieID   int       `json:"movieId"`
    Action    string    `json:"action"`
    CreatedAt time.Time `json:"createdAt"`
}

type AddToWatchlistRequest struct {
    MovieID int `json:"movieId" binding:"required"`
}

type AddToHistoryRequest struct {
    MovieID int    `json:"movieId" binding:"required"`
    Action  string `json:"action" binding:"required"`
}
