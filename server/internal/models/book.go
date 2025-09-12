package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type BookStatus string

const (
	BookStatusAvailable BookStatus = "available"
	BookStatusLoaned    BookStatus = "loaned"
	BookStatusReserved  BookStatus = "reserved"
	BookStatusLost      BookStatus = "lost"
	BookStatusDamaged   BookStatus = "damaged"
)

type Book struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title           string         `gorm:"not null;index" json:"title"`
	Author          string         `gorm:"not null;index" json:"author"`
	ISBN            string         `gorm:"uniqueIndex" json:"isbn"`
	Publisher       string         `json:"publisher"`
	PublishDate     time.Time      `json:"publish_date"`
	Category        string         `gorm:"index" json:"category"`
	Description     string         `gorm:"type:text" json:"description"`
	CoverImage      string         `json:"cover_image"`
	TotalCopies     int            `gorm:"default:1" json:"total_copies"`
	AvailableCopies int            `gorm:"default:1" json:"available_copies"`
	Location        string         `json:"location"`
	Status          BookStatus     `gorm:"type:varchar(20);default:'available'" json:"status"`
	Tags            pq.StringArray `gorm:"type:text[]" json:"tags"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	
	Loans           []Loan         `gorm:"foreignKey:BookID" json:"loans,omitempty"`
	Reservations    []Reservation  `gorm:"foreignKey:BookID" json:"reservations,omitempty"`
}

func (b *Book) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

func (b *Book) IsAvailable() bool {
	return b.AvailableCopies > 0 && b.Status == BookStatusAvailable
}

func (b *Book) DecrementAvailable() {
	if b.AvailableCopies > 0 {
		b.AvailableCopies--
		if b.AvailableCopies == 0 {
			b.Status = BookStatusLoaned
		}
	}
}

func (b *Book) IncrementAvailable() {
	b.AvailableCopies++
	if b.AvailableCopies > 0 && b.Status == BookStatusLoaned {
		b.Status = BookStatusAvailable
	}
}

type BookRequest struct {
	Title           string    `json:"title" binding:"required"`
	Author          string    `json:"author" binding:"required"`
	ISBN            string    `json:"isbn" binding:"required"`
	Publisher       string    `json:"publisher"`
	PublishDate     time.Time `json:"publish_date"`
	Category        string    `json:"category"`
	Description     string    `json:"description"`
	CoverImage      string    `json:"cover_image"`
	TotalCopies     int       `json:"total_copies" binding:"min=1"`
	AvailableCopies int       `json:"available_copies"`
	Location        string    `json:"location"`
	Tags            []string  `json:"tags"`
}

type BookResponse struct {
	ID              string         `json:"id"`
	Title           string         `json:"title"`
	Author          string         `json:"author"`
	ISBN            string         `json:"isbn"`
	Publisher       string         `json:"publisher"`
	PublishDate     time.Time      `json:"publish_date"`
	Category        string         `json:"category"`
	Description     string         `json:"description"`
	CoverImage      string         `json:"cover_image"`
	TotalCopies     int            `json:"total_copies"`
	AvailableCopies int            `json:"available_copies"`
	Location        string         `json:"location"`
	Status          string         `json:"status"`
	Tags            []string       `json:"tags"`
	IsAvailable     bool           `json:"is_available"`
	CurrentLoanID   *string        `json:"current_loan_id,omitempty"`
	ReservationIDs  []string       `json:"reservation_queue,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
}

type BookStatistics struct {
	TotalBooks      int64 `json:"total_books"`
	AvailableBooks  int64 `json:"available_books"`
	LoanedBooks     int64 `json:"loaned_books"`
	ReservedBooks   int64 `json:"reserved_books"`
	LostBooks       int64 `json:"lost_books"`
	DamagedBooks    int64 `json:"damaged_books"`
	TotalCopies     int64 `json:"total_copies"`
	AvailableCopies int64 `json:"available_copies"`
}