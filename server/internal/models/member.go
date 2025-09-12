package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MembershipType string

const (
	MembershipBasic   MembershipType = "basic"
	MembershipPremium MembershipType = "premium"
	MembershipStudent MembershipType = "student"
)

type Member struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	MembershipID       string         `gorm:"uniqueIndex;not null" json:"membership_id"`
	MembershipType     MembershipType `gorm:"type:varchar(20);default:'basic'" json:"membership_type"`
	JoinDate           time.Time      `gorm:"not null" json:"join_date"`
	ExpiryDate         *time.Time     `json:"expiry_date"`
	MaxBooksAllowed    int            `gorm:"default:5" json:"max_books_allowed"`
	CurrentBooksIssued int            `gorm:"default:0" json:"current_books_issued"`
	TotalFineAmount    float64        `gorm:"default:0" json:"total_fine_amount"`
	FinesPaid          float64        `gorm:"default:0" json:"fines_paid"`
	IsActive           bool           `gorm:"default:true" json:"is_active"`
	Address            string         `json:"address"`
	City               string         `json:"city"`
	State              string         `json:"state"`
	ZipCode            string         `json:"zip_code"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
	
	User               User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Loans              []Loan         `gorm:"foreignKey:MemberID" json:"loans,omitempty"`
	Reservations       []Reservation  `gorm:"foreignKey:MemberID" json:"reservations,omitempty"`
}

func (m *Member) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	
	if m.MembershipID == "" {
		m.MembershipID = m.GenerateMembershipID()
	}
	
	if m.JoinDate.IsZero() {
		m.JoinDate = time.Now()
	}
	
	return nil
}

func (m *Member) GenerateMembershipID() string {
	return fmt.Sprintf("MEM%d%s", time.Now().Unix(), uuid.New().String()[:8])
}

func (m *Member) CanBorrowMore() bool {
	return m.IsActive && m.CurrentBooksIssued < m.MaxBooksAllowed
}

func (m *Member) HasOutstandingFines() bool {
	return (m.TotalFineAmount - m.FinesPaid) > 0
}

func (m *Member) GetOutstandingFines() float64 {
	return m.TotalFineAmount - m.FinesPaid
}

func (m *Member) IsExpired() bool {
	if m.ExpiryDate == nil {
		return false
	}
	return m.ExpiryDate.Before(time.Now())
}

type MemberRequest struct {
	UserID         string    `json:"user_id"`
	Email          string    `json:"email"`
	FullName       string    `json:"full_name"`
	Phone          string    `json:"phone"`
	MembershipType string    `json:"membership_type"`
	Address        string    `json:"address"`
	City           string    `json:"city"`
	State          string    `json:"state"`
	ZipCode        string    `json:"zip_code"`
	ExpiryDate     time.Time `json:"expiry_date"`
}

type MemberResponse struct {
	ID                 string         `json:"id"`
	MembershipID       string         `json:"membership_id"`
	Name               string         `json:"name"`
	Email              string         `json:"email"`
	Phone              string         `json:"phone"`
	MembershipType     string         `json:"membership_type"`
	JoinDate           time.Time      `json:"join_date"`
	ExpiryDate         *time.Time     `json:"expiry_date"`
	MaxBooksAllowed    int            `json:"max_books_allowed"`
	CurrentBooksIssued int            `json:"current_books_issued"`
	OutstandingFines   float64        `json:"outstanding_fines"`
	IsActive           bool           `json:"is_active"`
	IsExpired          bool           `json:"is_expired"`
	Address            string         `json:"address"`
	City               string         `json:"city"`
	State              string         `json:"state"`
	ZipCode            string         `json:"zip_code"`
	CreatedAt          time.Time      `json:"created_at"`
}

type MemberStatistics struct {
	TotalMembers       int64   `json:"total_members"`
	ActiveMembers      int64   `json:"active_members"`
	ExpiredMembers     int64   `json:"expired_members"`
	MembersWithLoans   int64   `json:"members_with_loans"`
	MembersWithFines   int64   `json:"members_with_fines"`
	TotalOutstandingFines float64 `json:"total_outstanding_fines"`
}