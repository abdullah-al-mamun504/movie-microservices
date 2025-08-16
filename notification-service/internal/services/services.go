// notification-service/internal/services/services.go

package services

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "html/template"
    "movie-microservices/notification-service/internal/config"
    "movie-microservices/notification-service/internal/models"
    "movie-microservices/notification-service/internal/repository"
    "strconv"
    "time"

    "github.com/go-redis/redis/v8"
    "github.com/rs/zerolog/log"
)

type EmailService interface {
    Send(to, subject, content string) error
    SendWithTemplate(to string, template *models.Template, data interface{}) error
}

type SendGridEmailService struct {
    apiKey    string
    fromEmail string
    fromName  string
}

func NewEmailService(cfg config.EmailConfig) EmailService {
    return &SendGridEmailService{
        apiKey:    cfg.APIKey,
        fromEmail: cfg.FromEmail,
        fromName:  cfg.FromName,
    }
}

func (s *SendGridEmailService) Send(to, subject, content string) error {
    // This is a placeholder implementation
    // In a real implementation, you would use the SendGrid API
    log.Info().
        Str("to", to).
        Str("subject", subject).
        Msg("Sending email (placeholder implementation)")
    return nil
}

func (s *SendGridEmailService) SendWithTemplate(to string, template *models.Template, data interface{}) error {
    // Parse template
    tmpl, err := template.New("email").Parse(template.Content)
    if err != nil {
        return fmt.Errorf("failed to parse email template: %w", err)
    }
    
    // Execute template
    var content bytes.Buffer
    if err := tmpl.Execute(&content, data); err != nil {
        return fmt.Errorf("failed to execute email template: %w", err)
    }
    
    // Send email
    return s.Send(to, template.Subject, content.String())
}

type PushService interface {
    Send(to, title, content string) error
}

type FCMPushService struct {
    apiKey    string
    authToken string
}

func NewPushService(cfg config.PushConfig) PushService {
    return &FCMPushService{
        apiKey:    cfg.APIKey,
        authToken: cfg.AuthToken,
    }
}

func (s *FCMPushService) Send(to, title, content string) error {
    // This is a placeholder implementation
    // In a real implementation, you would use the FCM API
    log.Info().
        Str("to", to).
        Str("title", title).
        Msg("Sending push notification (placeholder implementation)")
    return nil
}

type NotificationService interface {
    Create(userID int, notificationType, title, content string, channel string) (*models.Notification, error)
    SendPending() error
    GetUserNotifications(userID int) ([]*models.Notification, error)
    MarkAsRead(id int) error
    SendMovieRecommendation(userID int, username, movieTitle string) error
    SendWatchlistReminder(userID int, username string, count int) error
    SendNewRelease(userID int, username, movieTitle string) error
    SendRatingReminder(userID int, username, movieTitle string) error
}

type notificationService struct {
    notificationRepo repository.NotificationRepository
    templateRepo     repository.TemplateRepository
    preferenceRepo   repository.PreferenceRepository
    emailService     EmailService
    pushService      PushService
    redis            *redis.Client
}

func NewNotificationService(
    notificationRepo repository.NotificationRepository,
    templateRepo repository.TemplateRepository,
    preferenceRepo repository.PreferenceRepository,
    emailService EmailService,
    pushService PushService,
    redis *redis.Client,
) NotificationService {
    return &notificationService{
        notificationRepo: notificationRepo,
        templateRepo:     templateRepo,
        preferenceRepo:   preferenceRepo,
        emailService:     emailService,
        pushService:      pushService,
        redis:            redis,
    }
}

func (s *notificationService) Create(userID int, notificationType, title, content string, channel string) (*models.Notification, error) {
    notification := &models.Notification{
        UserID:  userID,
        Type:    notificationType,
        Title:   title,
        Content: content,
        Status:  "pending",
        Channel: channel,
    }
    
    created, err := s.notificationRepo.Create(notification)
    if err != nil {
        return nil, err
    }
    
    // Invalidate cache
    ctx := context.Background()
    cacheKey := "notifications:" + strconv.Itoa(userID)
    s.redis.Del(ctx, cacheKey)
    
    return created, nil
}

func (s *notificationService) SendPending() error {
    // Get pending notifications
    notifications, err := s.notificationRepo.GetPending()
    if err != nil {
        return err
    }
    
    // Process each notification
    for _, notification := range notifications {
        // Get user preferences
        preferences, err := s.preferenceRepo.GetByUserID(notification.UserID)
        if err != nil {
            log.Error().Err(err).Int("userID", notification.UserID).Msg("Failed to get user preferences")
            continue
        }
        
        // Send notification based on channel and preferences
        var sendErr error
        switch notification.Channel {
        case "email":
            if preferences.EmailEnabled {
                sendErr = s.emailService.Send(
                    fmt.Sprintf("user%d@example.com", notification.UserID), // Placeholder email
                    notification.Title,
                    notification.Content,
                )
            }
        case "push":
            if preferences.PushEnabled {
                sendErr = s.pushService.Send(
                    strconv.Itoa(notification.UserID), // Placeholder device token
                    notification.Title,
                    notification.Content,
                )
            }
        }
        
        if sendErr != nil {
            log.Error().Err(sendErr).Int("notificationID", notification.ID).Msg("Failed to send notification")
            // Update status to failed
            s.notificationRepo.UpdateStatus(notification.ID, "failed")
        } else {
            // Update status to sent
            s.notificationRepo.UpdateStatus(notification.ID, "sent")
        }
    }
    
    return nil
}

func (s *notificationService) GetUserNotifications(userID int) ([]*models.Notification, error) {
    // Try to get from cache first
    ctx := context.Background()
    cacheKey := "notifications:" + strconv.Itoa(userID)
    cached, err := s.redis.Get(ctx, cacheKey).Result()
    if err == nil {
        // Cache hit
        var notifications []*models.Notification
        if err := json.Unmarshal([]byte(cached), &notifications); err == nil {
            return notifications, nil
        }
    }
    
    // Cache miss, get from database
    notifications, err := s.notificationRepo.GetByUserID(userID)
    if err != nil {
        return nil, err
    }
    
    // Cache the result
    if data, err := json.Marshal(notifications); err == nil {
        s.redis.Set(ctx, cacheKey, data, 5*time.Minute)
    }
    
    return notifications, nil
}

func (s *notificationService) MarkAsRead(id int) error {
    return s.notificationRepo.MarkAsRead(id)
}

func (s *notificationService) SendMovieRecommendation(userID int, username, movieTitle string) error {
    // Get template
    template, err := s.templateRepo.GetByNameAndType("movie_recommendation", "email")
    if err != nil {
        return err
    }
    if template == nil {
        return fmt.Errorf("template not found")
    }
    
    // Get user preferences
    preferences, err := s.preferenceRepo.GetByUserID(userID)
    if err != nil {
        return err
    }
    
    // Prepare template data
    data := struct {
        Username   string
        MovieTitle string
    }{
        Username:   username,
        MovieTitle: movieTitle,
    }
    
    // Send email if enabled
    if preferences.EmailEnabled {
        if err := s.emailService.SendWithTemplate(
            fmt.Sprintf("user%d@example.com", userID), // Placeholder email
            template,
            data,
        ); err != nil {
            return err
        }
        
        // Create notification record
        _, err = s.Create(userID, "movie_recommendation", "New Movie Recommendation",
            fmt.Sprintf("We have a new movie recommendation for you: %s", movieTitle), "email")
        if err != nil {
            log.Error().Err(err).Msg("Failed to create notification record")
        }
    }
    
    return nil
}

func (s *notificationService) SendWatchlistReminder(userID int, username string, count int) error {
    // Get template
    template, err := s.templateRepo.GetByNameAndType("watchlist_reminder", "email")
    if err != nil {
        return err
    }
    if template == nil {
        return fmt.Errorf("template not found")
    }
    
    // Get user preferences
    preferences, err := s.preferenceRepo.GetByUserID(userID)
    if err != nil {
        return err
    }
    
    // Prepare template data
    data := struct {
        Username string
        Count    int
    }{
        Username: username,
        Count:    count,
    }
    
    // Send email if enabled
    if preferences.EmailEnabled {
        if err := s.emailService.SendWithTemplate(
            fmt.Sprintf("user%d@example.com", userID), // Placeholder email
            template,
            data,
        ); err != nil {
            return err
        }
        
        // Create notification record
        _, err = s.Create(userID, "watchlist_reminder", "Movies in Your Watchlist",
            fmt.Sprintf("You have %d movies in your watchlist. Why not watch one tonight?", count), "email")
        if err != nil {
            log.Error().Err(err).Msg("Failed to create notification record")
        }
    }
    
    return nil
}

func (s *notificationService) SendNewRelease(userID int, username, movieTitle string) error {
    // Get template
    template, err := s.templateRepo.GetByNameAndType("new_release", "email")
    if err != nil {
        return err
    }
    if template == nil {
        return fmt.Errorf("template not found")
    }
    
    // Get user preferences
    preferences, err := s.preferenceRepo.GetByUserID(userID)
    if err != nil {
        return err
    }
    
    // Prepare template data
    data := struct {
        Username   string
        MovieTitle string
    }{
        Username:   username,
        MovieTitle: movieTitle,
    }
    
    // Send email if enabled
    if preferences.EmailEnabled {
        if err := s.emailService.SendWithTemplate(
            fmt.Sprintf("user%d@example.com", userID), // Placeholder email
            template,
            data,
        ); err != nil {
            return err
        }
        
        // Create notification record
        _, err = s.Create(userID, "new_release", "New Movie Release",
            fmt.Sprintf("A new movie \"%s\" has been released that you might like.", movieTitle), "email")
        if err != nil {
            log.Error().Err(err).Msg("Failed to create notification record")
        }
    }
    
    return nil
}

func (s *notificationService) SendRatingReminder(userID int, username, movieTitle string) error {
    // Get template
    template, err := s.templateRepo.GetByNameAndType("rating_reminder", "email")
    if err != nil {
        return err
    }
    if template == nil {
        return fmt.Errorf("template not found")
    }
    
    // Get user preferences
    preferences, err := s.preferenceRepo.GetByUserID(userID)
    if err != nil {
        return err
    }
    
    // Prepare template data
    data := struct {
        Username   string
        MovieTitle string
    }{
        Username:   username,
        MovieTitle: movieTitle,
    }
    
    // Send email if enabled
    if preferences.EmailEnabled {
        if err := s.emailService.SendWithTemplate(
            fmt.Sprintf("user%d@example.com", userID), // Placeholder email
            template,
            data,
        ); err != nil {
            return err
        }
        
        // Create notification record
        _, err = s.Create(userID, "rating_reminder", "Rate Your Watched Movies",
            fmt.Sprintf("You recently watched \"%s\". Would you like to rate it?", movieTitle), "email")
        if err != nil {
            log.Error().Err(err).Msg("Failed to create notification record")
        }
    }
    
    return nil
}

// TemplateService implementation
type TemplateService interface {
    GetAllTemplates() ([]*models.Template, error)
    GetTemplateByID(id int) (*models.Template, error)
    CreateTemplate(template *models.Template) (*models.Template, error)
    UpdateTemplate(id int, template *models.Template) (*models.Template, error)
    DeleteTemplate(id int) error
}

type templateService struct {
    repo repository.TemplateRepository
}

func NewTemplateService(repo repository.TemplateRepository) TemplateService {
    return &templateService{repo: repo}
}

func (s *templateService) GetAllTemplates() ([]*models.Template, error) {
    return s.repo.GetAll()
}

func (s *templateService) GetTemplateByID(id int) (*models.Template, error) {
    return s.repo.GetByID(id)
}

func (s *templateService) CreateTemplate(template *models.Template) (*models.Template, error) {
    return s.repo.Create(template)
}

func (s *templateService) UpdateTemplate(id int, template *models.Template) (*models.Template, error) {
    template.ID = id
    return s.repo.Update(template)
}

func (s *templateService) DeleteTemplate(id int) error {
    return s.repo.Delete(id)
}

// PreferenceService implementation
type PreferenceService interface {
    GetPreferences(userID int) (*models.Preference, error)
    UpdatePreferences(userID int, req models.UpdatePreferenceRequest) (*models.Preference, error)
}

type preferenceService struct {
    repo repository.PreferenceRepository
}

func NewPreferenceService(repo repository.PreferenceRepository) PreferenceService {
    return &preferenceService{repo: repo}
}

func (s *preferenceService) GetPreferences(userID int) (*models.Preference, error) {
    return s.repo.GetByUserID(userID)
}

func (s *preferenceService) UpdatePreferences(userID int, req models.UpdatePreferenceRequest) (*models.Preference, error) {
    // Get current preferences
    preference, err := s.repo.GetByUserID(userID)
    if err != nil {
        return nil, err
    }
    
    // Update fields if provided
    if req.EmailEnabled != nil {
        preference.EmailEnabled = *req.EmailEnabled
    }
    if req.PushEnabled != nil {
        preference.PushEnabled = *req.PushEnabled
    }
    
    // Save updated preferences
    return s.repo.CreateOrUpdate(preference)
}
