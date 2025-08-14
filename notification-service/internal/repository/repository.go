package repository

import (
    "database/sql"
    "movie-microservices/notification-service/internal/models"
)

type NotificationRepository interface {
    GetByUserID(userID int) ([]*models.Notification, error)
    GetByID(id int) (*models.Notification, error)
    Create(notification *models.Notification) (*models.Notification, error)
    UpdateStatus(id int, status string) error
    MarkAsRead(id int) error
    Delete(id int) error
    GetPending() ([]*models.Notification, error)
}

type TemplateRepository interface {
    GetAll() ([]*models.Template, error)
    GetByID(id int) (*models.Template, error)
    GetByNameAndType(name, templateType string) (*models.Template, error)
    Create(template *models.Template) (*models.Template, error)
    Update(template *models.Template) (*models.Template, error)
    Delete(id int) error
}

type PreferenceRepository interface {
    GetByUserID(userID int) (*models.Preference, error)
    CreateOrUpdate(preference *models.Preference) (*models.Preference, error)
}

type notificationRepository struct {
    db *sql.DB
}

func NewNotificationRepository(db *sql.DB) NotificationRepository {
    return &notificationRepository{db: db}
}

func (r *notificationRepository) GetByUserID(userID int) ([]*models.Notification, error) {
    rows, err := r.db.Query(`
        SELECT id, user_id, type, title, content, status, channel, created_at, sent_at, read_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    `, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var notifications []*models.Notification
    for rows.Next() {
        n := &models.Notification{}
        err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Content, &n.Status, &n.Channel, &n.CreatedAt, &n.SentAt, &n.ReadAt)
        if err != nil {
            return nil, err
        }
        notifications = append(notifications, n)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return notifications, nil
}

func (r *notificationRepository) GetByID(id int) (*models.Notification, error) {
    n := &models.Notification{}
    err := r.db.QueryRow(`
        SELECT id, user_id, type, title, content, status, channel, created_at, sent_at, read_at
        FROM notifications
        WHERE id = $1
    `, id).Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Content, &n.Status, &n.Channel, &n.CreatedAt, &n.SentAt, &n.ReadAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, err
    }

    return n, nil
}

func (r *notificationRepository) Create(notification *models.Notification) (*models.Notification, error) {
    err := r.db.QueryRow(`
        INSERT INTO notifications (user_id, type, title, content, status, channel)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
    `, notification.UserID, notification.Type, notification.Title, notification.Content, notification.Status, notification.Channel).Scan(&notification.ID, &notification.CreatedAt)
    if err != nil {
        return nil, err
    }

    return notification, nil
}

func (r *notificationRepository) UpdateStatus(id int, status string) error {
    _, err := r.db.Exec(`
        UPDATE notifications
        SET status = $1, sent_at = CASE WHEN $1 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END
        WHERE id = $2
    `, status, id)
    return err
}

func (r *notificationRepository) MarkAsRead(id int) error {
    _, err := r.db.Exec(`
        UPDATE notifications
        SET read_at = CURRENT_TIMESTAMP
        WHERE id = $1
    `, id)
    return err
}

func (r *notificationRepository) Delete(id int) error {
    _, err := r.db.Exec(`
        DELETE FROM notifications
        WHERE id = $1
    `, id)
    return err
}

func (r *notificationRepository) GetPending() ([]*models.Notification, error) {
    rows, err := r.db.Query(`
        SELECT id, user_id, type, title, content, status, channel, created_at, sent_at, read_at
        FROM notifications
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 100
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var notifications []*models.Notification
    for rows.Next() {
        n := &models.Notification{}
        err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Content, &n.Status, &n.Channel, &n.CreatedAt, &n.SentAt, &n.ReadAt)
        if err != nil {
            return nil, err
        }
        notifications = append(notifications, n)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return notifications, nil
}

type templateRepository struct {
    db *sql.DB
}

func NewTemplateRepository(db *sql.DB) TemplateRepository {
    return &templateRepository{db: db}
}

func (r *templateRepository) GetAll() ([]*models.Template, error) {
    rows, err := r.db.Query(`
        SELECT id, name, type, subject, content, created_at, updated_at
        FROM templates
        ORDER BY name ASC
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var templates []*models.Template
    for rows.Next() {
        t := &models.Template{}
        err := rows.Scan(&t.ID, &t.Name, &t.Type, &t.Subject, &t.Content, &t.CreatedAt, &t.UpdatedAt)
        if err != nil {
            return nil, err
        }
        templates = append(templates, t)
    }

    if err := rows.Err(); err != nil {
        return nil, err
    }

    return templates, nil
}

func (r *templateRepository) GetByID(id int) (*models.Template, error) {
    t := &models.Template{}
    err := r.db.QueryRow(`
        SELECT id, name, type, subject, content, created_at, updated_at
        FROM templates
        WHERE id = $1
    `, id).Scan(&t.ID, &t.Name, &t.Type, &t.Subject, &t.Content, &t.CreatedAt, &t.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, err
    }

    return t, nil
}

func (r *templateRepository) GetByNameAndType(name, templateType string) (*models.Template, error) {
    t := &models.Template{}
    err := r.db.QueryRow(`
        SELECT id, name, type, subject, content, created_at, updated_at
        FROM templates
        WHERE name = $1 AND type = $2
    `, name, templateType).Scan(&t.ID, &t.Name, &t.Type, &t.Subject, &t.Content, &t.CreatedAt, &t.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, nil
        }
        return nil, err
    }

    return t, nil
}

func (r *templateRepository) Create(template *models.Template) (*models.Template, error) {
    err := r.db.QueryRow(`
        INSERT INTO templates (name, type, subject, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at, updated_at
    `, template.Name, template.Type, template.Subject, template.Content).Scan(&template.ID, &template.CreatedAt, &template.UpdatedAt)
    if err != nil {
        return nil, err
    }

    return template, nil
}

func (r *templateRepository) Update(template *models.Template) (*models.Template, error) {
    err := r.db.QueryRow(`
        UPDATE templates
        SET name = $1, type = $2, subject = $3, content = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING updated_at
    `, template.Name, template.Type, template.Subject, template.Content, template.ID).Scan(&template.UpdatedAt)
    if err != nil {
        return nil, err
    }

    return template, nil
}

func (r *templateRepository) Delete(id int) error {
    _, err := r.db.Exec(`
        DELETE FROM templates
        WHERE id = $1
    `, id)
    return err
}

type preferenceRepository struct {
    db *sql.DB
}

func NewPreferenceRepository(db *sql.DB) PreferenceRepository {
    return &preferenceRepository{db: db}
}

func (r *preferenceRepository) GetByUserID(userID int) (*models.Preference, error) {
    p := &models.Preference{}
    err := r.db.QueryRow(`
        SELECT id, user_id, email_enabled, push_enabled, created_at, updated_at
        FROM preferences
        WHERE user_id = $1
    `, userID).Scan(&p.ID, &p.UserID, &p.EmailEnabled, &p.PushEnabled, &p.CreatedAt, &p.UpdatedAt)
    if err != nil {
        if err == sql.ErrNoRows {
            // Return default preferences if not found
            return &models.Preference{
                UserID:       userID,
                EmailEnabled: true,
                PushEnabled:  true,
            }, nil
        }
        return nil, err
    }

    return p, nil
}

func (r *preferenceRepository) CreateOrUpdate(preference *models.Preference) (*models.Preference, error) {
    // Try to update first
    result, err := r.db.Exec(`
        UPDATE preferences
        SET email_enabled = $1, push_enabled = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3
        RETURNING id
    `, preference.EmailEnabled, preference.PushEnabled, preference.UserID)

    if err != nil {
        return nil, err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return nil, err
    }

    if rowsAffected > 0 {
        // Updated existing record
        var id int
        err = r.db.QueryRow(`
            SELECT id, created_at, updated_at
            FROM preferences
            WHERE user_id = $1
        `, preference.UserID).Scan(&id, &preference.CreatedAt, &preference.UpdatedAt)
        if err != nil {
            return nil, err
        }
        preference.ID = id
    } else {
        // Insert new record
        err = r.db.QueryRow(`
            INSERT INTO preferences (user_id, email_enabled, push_enabled)
            VALUES ($1, $2, $3)
            RETURNING id, created_at, updated_at
        `, preference.UserID, preference.EmailEnabled, preference.PushEnabled).Scan(&preference.ID, &preference.CreatedAt, &preference.UpdatedAt)
        if err != nil {
            return nil, err
        }
    }

    return preference, nil
}
