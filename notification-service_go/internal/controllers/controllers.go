package controllers

import (
    "movie-microservices/notification-service/internal/models"
    "movie-microservices/notification-service/internal/services"
    "net/http"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/rs/zerolog/log"
)

type NotificationController struct {
    service services.NotificationService
}

func NewNotificationController(service services.NotificationService) *NotificationController {
    return &NotificationController{service: service}
}

func (ctrl *NotificationController) GetNotifications(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    notifications, err := ctrl.service.GetUserNotifications(userID.(int))
    if err != nil {
        log.Error().Err(err).Msg("Failed to get notifications")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notifications"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    notifications,
    })
}

func (ctrl *NotificationController) GetNotification(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
        return
    }

    // In a real implementation, we would check if the notification belongs to the user
    // For now, we'll just return a placeholder
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "id":      id,
            "message": "Notification details would be returned here",
        },
    })
}

func (ctrl *NotificationController) CreateNotification(c *gin.Context) {
    var req models.CreateNotificationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    notification, err := ctrl.service.Create(req.UserID, req.Type, req.Title, req.Content, req.Channel)
    if err != nil {
        log.Error().Err(err).Msg("Failed to create notification")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "data":    notification,
    })
}

func (ctrl *NotificationController) MarkAsRead(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
        return
    }

    err = ctrl.service.MarkAsRead(id)
    if err != nil {
        log.Error().Err(err).Msg("Failed to mark notification as read")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Notification marked as read",
    })
}

func (ctrl *NotificationController) DeleteNotification(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
        return
    }

    // In a real implementation, we would delete the notification from the database
    // For now, we'll just return a success message
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Notification deleted",
    })
}

type TemplateController struct {
    service services.TemplateService
}

func NewTemplateController(service services.TemplateService) *TemplateController {
    return &TemplateController{service: service}
}

func (ctrl *TemplateController) GetTemplates(c *gin.Context) {
    templates, err := ctrl.service.GetAllTemplates()
    if err != nil {
        log.Error().Err(err).Msg("Failed to get templates")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get templates"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    templates,
    })
}

func (ctrl *TemplateController) GetTemplate(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
        return
    }

    template, err := ctrl.service.GetTemplateByID(id)
    if err != nil {
        log.Error().Err(err).Msg("Failed to get template")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get template"})
        return
    }

    if template == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    template,
    })
}

func (ctrl *TemplateController) CreateTemplate(c *gin.Context) {
    var req models.CreateTemplateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    template, err := ctrl.service.CreateTemplate(&models.Template{
        Name:    req.Name,
        Type:    req.Type,
        Subject: req.Subject,
        Content: req.Content,
    })
    if err != nil {
        log.Error().Err(err).Msg("Failed to create template")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "data":    template,
    })
}

func (ctrl *TemplateController) UpdateTemplate(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
        return
    }

    var req models.CreateTemplateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    template, err := ctrl.service.UpdateTemplate(id, &models.Template{
        Name:    req.Name,
        Type:    req.Type,
        Subject: req.Subject,
        Content: req.Content,
    })
    if err != nil {
        log.Error().Err(err).Msg("Failed to update template")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    template,
    })
}

func (ctrl *TemplateController) DeleteTemplate(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
        return
    }

    err = ctrl.service.DeleteTemplate(id)
    if err != nil {
        log.Error().Err(err).Msg("Failed to delete template")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Template deleted",
    })
}

type PreferenceController struct {
    service services.PreferenceService
}

func NewPreferenceController(service services.PreferenceService) *PreferenceController {
    return &PreferenceController{service: service}
}

func (ctrl *PreferenceController) GetPreferences(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    preferences, err := ctrl.service.GetPreferences(userID.(int))
    if err != nil {
        log.Error().Err(err).Msg("Failed to get preferences")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get preferences"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    preferences,
    })
}

func (ctrl *PreferenceController) UpdatePreferences(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    var req models.UpdatePreferenceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    preferences, err := ctrl.service.UpdatePreferences(userID.(int), req)
    if err != nil {
        log.Error().Err(err).Msg("Failed to update preferences")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update preferences"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    preferences,
    })
}

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
        "service":   "notification-service",
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    })
}

func (ctrl *HealthController) Ready(c *gin.Context) {
    // Check database
    if err := ctrl.db.Ping(); err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":    "not ready",
            "service":   "notification-service",
            "timestamp": time.Now().UTC().Format(time.RFC3339),
            "error":     "Database not available",
        })
        return
    }

    // Check Redis
    ctx := context.Background()
    if _, err := ctrl.rdb.Ping(ctx).Result(); err != nil {
        c.JSON(http.StatusServiceUnavailable, gin.H{
            "status":    "not ready",
            "service":   "notification-service",
            "timestamp": time.Now().UTC().Format(time.RFC3339),
            "error":     "Redis not available",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status":    "ready",
        "service":   "notification-service",
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    })
}
