package controllers

import (
	"context"
	"database/sql"
	"movie-microservices/watchlist-service/internal/models"
	"movie-microservices/watchlist-service/internal/repository"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/rs/zerolog/log"
)

// WatchlistController handles watchlist operations
type WatchlistController struct {
	repo repository.WatchlistRepository
	rdb  *redis.Client
}

func NewWatchlistController(repo repository.WatchlistRepository, rdb *redis.Client) *WatchlistController {
	return &WatchlistController{repo: repo, rdb: rdb}
}

func (ctrl *WatchlistController) GetWatchlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "watchlist:" + strconv.Itoa(userID.(int))

	cached, err := ctrl.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": cached})
		return
	}

	items, err := ctrl.repo.GetByUserID(userID.(int))
	if err != nil {
		log.Error().Err(err).Msg("Failed to get watchlist")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get watchlist"})
		return
	}

	ctrl.rdb.Set(ctx, cacheKey, items, 5*time.Minute)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (ctrl *WatchlistController) AddToWatchlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.AddToWatchlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existsInDB, err := ctrl.repo.Exists(userID.(int), req.MovieID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to check watchlist existence")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check watchlist"})
		return
	}

	if existsInDB {
		c.JSON(http.StatusConflict, gin.H{"error": "Movie already in watchlist"})
		return
	}

	item, err := ctrl.repo.Add(userID.(int), req.MovieID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to add to watchlist")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to watchlist"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "watchlist:" + strconv.Itoa(userID.(int))
	ctrl.rdb.Del(ctx, cacheKey)

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

func (ctrl *WatchlistController) RemoveFromWatchlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	movieIDStr := c.Param("movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid movie ID"})
		return
	}

	if err := ctrl.repo.Remove(userID.(int), movieID); err != nil {
		log.Error().Err(err).Msg("Failed to remove from watchlist")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from watchlist"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "watchlist:" + strconv.Itoa(userID.(int))
	ctrl.rdb.Del(ctx, cacheKey)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Movie removed from watchlist"})
}

func (ctrl *WatchlistController) IsInWatchlist(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	movieIDStr := c.Param("movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid movie ID"})
		return
	}

	inWatchlist, err := ctrl.repo.Exists(userID.(int), movieID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to check watchlist existence")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check watchlist"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"inWatchlist": inWatchlist}})
}

// HistoryController handles history operations
type HistoryController struct {
	repo repository.HistoryRepository
	rdb  *redis.Client
}

func NewHistoryController(repo repository.HistoryRepository, rdb *redis.Client) *HistoryController {
	return &HistoryController{repo: repo, rdb: rdb}
}

func (ctrl *HistoryController) GetHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "history:" + strconv.Itoa(userID.(int))

	cached, err := ctrl.rdb.Get(ctx, cacheKey).Result()
	if err == nil {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": cached})
		return
	}

	items, err := ctrl.repo.GetByUserID(userID.(int))
	if err != nil {
		log.Error().Err(err).Msg("Failed to get history")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}

	ctrl.rdb.Set(ctx, cacheKey, items, 5*time.Minute)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

func (ctrl *HistoryController) AddToHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.AddToHistoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := ctrl.repo.Add(userID.(int), req.MovieID, req.Action)
	if err != nil {
		log.Error().Err(err).Msg("Failed to add to history")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to history"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "history:" + strconv.Itoa(userID.(int))
	ctrl.rdb.Del(ctx, cacheKey)

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

func (ctrl *HistoryController) RemoveFromHistory(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	movieIDStr := c.Param("movieId")
	movieID, err := strconv.Atoi(movieIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid movie ID"})
		return
	}

	if err := ctrl.repo.Remove(userID.(int), movieID); err != nil {
		log.Error().Err(err).Msg("Failed to remove from history")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from history"})
		return
	}

	ctx := c.Request.Context()
	cacheKey := "history:" + strconv.Itoa(userID.(int))
	ctrl.rdb.Del(ctx, cacheKey)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "History item removed"})
}

// HealthController handles service health checks
type HealthController struct {
	db  *sql.DB
	rdb *redis.Client
}

func NewHealthController(db *sql.DB, rdb *redis.Client) *HealthController {
	return &HealthController{db: db, rdb: rdb}
}

func (ctrl *HealthController) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "watchlist-service",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func (ctrl *HealthController) Ready(c *gin.Context) {
	if err := ctrl.db.Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    "not ready",
			"service":   "watchlist-service",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"error":     "Database not available",
		})
		return
	}

	ctx := context.Background()
	if _, err := ctrl.rdb.Ping(ctx).Result(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":    "not ready",
			"service":   "watchlist-service",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"error":     "Redis not available",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "ready",
		"service":   "watchlist-service",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

