// notification-service/cmd/main.go

package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "movie-microservices/notification-service/internal/config"
    "movie-microservices/notification-service/internal/controllers"
    "movie-microservices/notification-service/internal/database"
    "movie-microservices/notification-service/internal/middleware"
    "movie-microservices/notification-service/internal/redis"
    "movie-microservices/notification-service/internal/repository"
    "movie-microservices/notification-service/internal/services"

    "github.com/gin-gonic/gin"
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
)

func main() {
    // Load configuration
    cfg, err := config.LoadConfig()
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to load configuration")
    }

    // Initialize logger
    zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
    log.Logger = zerolog.New(os.Stdout).With().Timestamp().Logger()
    if cfg.Environment == "development" {
        log.Logger = log.Logger.Output(zerolog.ConsoleWriter{Out: os.Stdout})
        zerolog.SetGlobalLevel(zerolog.DebugLevel)
    } else {
        zerolog.SetGlobalLevel(zerolog.InfoLevel)
    }

    // Connect to database
    db, err := database.Connect(cfg.Database)
    if err != nil {
        log.Fatal().Err(err).Msg("Failed to connect to database")
    }
    defer db.Close()

    // Run database migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal().Err(err).Msg("Failed to run database migrations")
    }

    // Connect to Redis
    rdb := redis.Connect(cfg.Redis)
    defer rdb.Close()

    // Initialize repositories
    notificationRepo := repository.NewNotificationRepository(db)
    templateRepo := repository.NewTemplateRepository(db)
    preferenceRepo := repository.NewPreferenceRepository(db)

    // Initialize services
    emailService := services.NewEmailService(cfg.Email)
    pushService := services.NewPushService(cfg.Push)
    notificationService := services.NewNotificationService(
        notificationRepo,
        templateRepo,
        preferenceRepo,
        emailService,
        pushService,
        rdb,
    )
    
    // Initialize template service
    templateService := services.NewTemplateService(templateRepo)
    
    // Initialize preference service
    preferenceService := services.NewPreferenceService(preferenceRepo)

    // Initialize controllers
    notificationController := controllers.NewNotificationController(notificationService)
    templateController := controllers.NewTemplateController(templateService)
    preferenceController := controllers.NewPreferenceController(preferenceService)
    healthController := controllers.NewHealthController(db, rdb)

    // Setup Gin router
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }
    router := gin.Default()

    // Add middleware
    router.Use(middleware.Logger())
    router.Use(middleware.CORS())
    router.Use(middleware.RateLimiter())

    // Health check endpoints
    router.GET("/health", healthController.Health)
    router.GET("/ready", healthController.Ready)

    // API routes
    api := router.Group("/api")
    {
        // Notification routes
        notifications := api.Group("/notifications")
        {
            notifications.GET("", middleware.Authenticate(), notificationController.GetNotifications)
            notifications.GET("/:id", middleware.Authenticate(), notificationController.GetNotification)
            notifications.POST("", middleware.Authenticate("Admin"), notificationController.CreateNotification)
            notifications.PUT("/:id/read", middleware.Authenticate(), notificationController.MarkAsRead)
            notifications.DELETE("/:id", middleware.Authenticate("Admin"), notificationController.DeleteNotification)
        }

        // Template routes
        templates := api.Group("/templates")
        {
            templates.GET("", middleware.Authenticate("Admin"), templateController.GetTemplates)
            templates.GET("/:id", middleware.Authenticate("Admin"), templateController.GetTemplate)
            templates.POST("", middleware.Authenticate("Admin"), templateController.CreateTemplate)
            templates.PUT("/:id", middleware.Authenticate("Admin"), templateController.UpdateTemplate)
            templates.DELETE("/:id", middleware.Authenticate("Admin"), templateController.DeleteTemplate)
        }

        // Preference routes
        preferences := api.Group("/preferences")
        {
            preferences.GET("", middleware.Authenticate(), preferenceController.GetPreferences)
            preferences.PUT("", middleware.Authenticate(), preferenceController.UpdatePreferences)
        }
    }

    // Start server
    srv := &http.Server{
        Addr:    ":" + cfg.Port,
        Handler: router,
    }

    go func() {
        log.Info().Msgf("Starting notification service on port %s", cfg.Port)
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal().Err(err).Msg("Failed to start server")
        }
    }()

    // Wait for interrupt signal to gracefully shutdown the server
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Info().Msg("Shutting down server...")

    // Give outstanding requests a deadline for completion
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal().Err(err).Msg("Server forced to shutdown")
    }

    log.Info().Msg("Server exited")
}
