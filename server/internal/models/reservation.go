package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReservationStatus string

const (
	ReservationStatusPending   ReservationStatus = "pending"
	ReservationStatusFulfilled ReservationStatus = "fulfilled"
	ReservationStatusCancelled ReservationStatus = "cancelled"
	ReservationStatusExpired   ReservationStatus = "expired"
)

type Reservation struct {
	ID               uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	BookID           uuid.UUID         `gorm:"type:uuid;not null;index" json:"book_id"`
	MemberID         uuid.UUID         `gorm:"type:uuid;not null;index" json:"member_id"`
	ReservationDate  time.Time         `gorm:"not null" json:"reservation_date"`
	ExpiryDate       time.Time         `gorm:"not null" json:"expiry_date"`
	FulfilledDate    *time.Time        `json:"fulfilled_date"`
	CancelledDate    *time.Time        `json:"cancelled_date"`
	Status           ReservationStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	QueuePosition    int               `gorm:"default:1" json:"queue_position"`
	NotificationSent bool              `gorm:"default:false" json:"notification_sent"`
	Notes            string            `gorm:"type:text" json:"notes"`
	CreatedAt        time.Time         `json:"created_at"`
	UpdatedAt        time.Time         `json:"updated_at"`
	DeletedAt        gorm.DeletedAt    `gorm:"index" json:"-"`
	
	Book             Book              `gorm:"foreignKey:BookID" json:"book,omitempty"`
	Member           Member            `gorm:"foreignKey:MemberID" json:"member,omitempty"`
}

func (r *Reservation) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	
	if r.ReservationDate.IsZero() {
		r.ReservationDate = time.Now()
	}
	
	if r.ExpiryDate.IsZero() {
		r.ExpiryDate = r.ReservationDate.AddDate(0, 0, 7)
	}
	
	return nil
}

func (r *Reservation) IsExpired() bool {
	return r.Status == ReservationStatusPending && time.Now().After(r.ExpiryDate)
}

func (r *Reservation) Cancel() {
	now := time.Now()
	r.Status = ReservationStatusCancelled
	r.CancelledDate = &now
}

func (r *Reservation) Fulfill() {
	now := time.Now()
	r.Status = ReservationStatusFulfilled
	r.FulfilledDate = &now
}

func (r *Reservation) UpdateQueuePosition(position int) {
	r.QueuePosition = position
}

type ReservationRequest struct {
	BookID   string `json:"book_id" binding:"required"`
	MemberID string `json:"member_id"`
	Notes    string `json:"notes"`
}

type ReservationResponse struct {
	ID              string          `json:"id"`
	BookID          string          `json:"book_id"`
	MemberID        string          `json:"member_id"`
	ReservationDate time.Time       `json:"reservation_date"`
	ExpiryDate      time.Time       `json:"expiry_date"`
	FulfilledDate   *time.Time      `json:"fulfilled_date"`
	CancelledDate   *time.Time      `json:"cancelled_date"`
	Status          string          `json:"status"`
	QueuePosition   int             `json:"queue_position"`
	IsExpired       bool            `json:"is_expired"`
	Notes           string          `json:"notes"`
	Book            *BookResponse   `json:"book,omitempty"`
	Member          *MemberResponse `json:"member,omitempty"`
	CreatedAt       time.Time       `json:"created_at"`
}

type CancelReservationRequest struct {
	ReservationID string `json:"reservation_id" binding:"required"`
	Reason        string `json:"reason"`
}

type ReservationStatistics struct {
	TotalReservations     int64 `json:"total_reservations"`
	PendingReservations   int64 `json:"pending_reservations"`
	FulfilledReservations int64 `json:"fulfilled_reservations"`
	CancelledReservations int64 `json:"cancelled_reservations"`
	ExpiredReservations   int64 `json:"expired_reservations"`
	AverageWaitTime       float64 `json:"average_wait_time_hours"`
}