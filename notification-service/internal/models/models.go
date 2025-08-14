package models

import "time"

type Notification struct {
    ID        int       `json:"id"`
    UserID    int       `json:"userId"`
    Type      string    `json:"type"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    Status    string    `json:"status"`
    Channel   string    `json:"channel"`
    CreatedAt time.Time `json:"createdAt"`
    SentAt    time.Time `json:"sentAt"`
    ReadAt    time.Time `json:"readAt"`
}

type Template struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Type      string    `json:"type"`
    Subject   string    `json:"subject"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type Preference struct {
    ID           int       `json:"id"`
    UserID       int       `json:"userId"`
    EmailEnabled bool      `json:"emailEnabled"`
    PushEnabled  bool      `json:"pushEnabled"`
    CreatedAt    time.Time `json:"createdAt"`
    UpdatedAt    time.Time `json:"updatedAt"`
}

type CreateNotificationRequest struct {
    UserID  int    `json:"userId" binding:"required"`
    Type    string `json:"type" binding:"required"`
    Title   string `json:"title" binding:"required"`
    Content string `json:"content"`
    Channel string `json:"channel"`
}

type CreateTemplateRequest struct {
    Name    string `json:"name" binding:"required"`
    Type    string `json:"type" binding:"required"`
    Subject string `json:"subject"`
    Content string `json:"content" binding:"required"`
}

type UpdatePreferenceRequest struct {
    EmailEnabled *bool `json:"emailEnabled"`
    PushEnabled  *bool `json:"pushEnabled"`
}
