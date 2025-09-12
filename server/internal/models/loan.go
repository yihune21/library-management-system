package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LoanStatus string

const (
	LoanStatusActive   LoanStatus = "active"
	LoanStatusReturned LoanStatus = "returned"
	LoanStatusOverdue  LoanStatus = "overdue"
	LoanStatusLost     LoanStatus = "lost"
)

type Loan struct {
	ID               uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	BookID           uuid.UUID      `gorm:"type:uuid;not null;index" json:"book_id"`
	MemberID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"member_id"`
	IssuedByID       uuid.UUID      `gorm:"type:uuid;not null" json:"issued_by_id"`
	LoanDate         time.Time      `gorm:"not null" json:"loan_date"`
	DueDate          time.Time      `gorm:"not null" json:"due_date"`
	ReturnDate       *time.Time     `json:"return_date"`
	ActualReturnDate *time.Time     `json:"actual_return_date"`
	Status           LoanStatus     `gorm:"type:varchar(20);default:'active';index" json:"status"`
	RenewalCount     int            `gorm:"default:0" json:"renewal_count"`
	MaxRenewals      int            `gorm:"default:2" json:"max_renewals"`
	FineAmount       float64        `gorm:"default:0" json:"fine_amount"`
	FinePaid         bool           `gorm:"default:false" json:"fine_paid"`
	Notes            string         `gorm:"type:text" json:"notes"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	
	Book             Book           `gorm:"foreignKey:BookID" json:"book,omitempty"`
	Member           Member         `gorm:"foreignKey:MemberID" json:"member,omitempty"`
	IssuedBy         User           `gorm:"foreignKey:IssuedByID" json:"issued_by,omitempty"`
}

func (l *Loan) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	
	if l.LoanDate.IsZero() {
		l.LoanDate = time.Now()
	}
	
	if l.DueDate.IsZero() {
		l.DueDate = l.LoanDate.AddDate(0, 0, 14)
	}
	
	return nil
}

func (l *Loan) IsOverdue() bool {
	if l.Status == LoanStatusReturned {
		return false
	}
	return time.Now().After(l.DueDate)
}

func (l *Loan) CalculateFine(finePerDay float64) float64 {
	if !l.IsOverdue() {
		return 0
	}
	
	endDate := time.Now()
	if l.ActualReturnDate != nil {
		endDate = *l.ActualReturnDate
	}
	
	daysOverdue := int(endDate.Sub(l.DueDate).Hours() / 24)
	if daysOverdue <= 0 {
		return 0
	}
	
	return float64(daysOverdue) * finePerDay
}

func (l *Loan) CanRenew() bool {
	return l.Status == LoanStatusActive && l.RenewalCount < l.MaxRenewals && !l.IsOverdue()
}

func (l *Loan) Renew(days int) {
	if l.CanRenew() {
		l.DueDate = l.DueDate.AddDate(0, 0, days)
		l.RenewalCount++
	}
}

type LoanRequest struct {
	BookID   string `json:"book_id" binding:"required"`
	MemberID string `json:"member_id" binding:"required"`
	DueDate  string `json:"due_date"`
	Notes    string `json:"notes"`
}

type LoanResponse struct {
	ID               string     `json:"id"`
	BookID           string     `json:"book_id"`
	MemberID         string     `json:"member_id"`
	LoanDate         time.Time  `json:"loan_date"`
	DueDate          time.Time  `json:"due_date"`
	ReturnDate       *time.Time `json:"return_date"`
	ActualReturnDate *time.Time `json:"actual_return_date"`
	Status           string     `json:"status"`
	IsOverdue        bool       `json:"is_overdue"`
	RenewalCount     int        `json:"renewal_count"`
	MaxRenewals      int        `json:"max_renewals"`
	CanRenew         bool       `json:"can_renew"`
	FineAmount       float64    `json:"fine_amount"`
	FinePaid         bool       `json:"fine_paid"`
	Notes            string     `json:"notes"`
	Book             *BookResponse   `json:"book,omitempty"`
	Member           *MemberResponse `json:"member,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

type ReturnBookRequest struct {
	LoanID           string    `json:"loan_id" binding:"required"`
	ActualReturnDate time.Time `json:"actual_return_date"`
}

type RenewLoanRequest struct {
	LoanID        string    `json:"loan_id" binding:"required"`
	NewReturnDate time.Time `json:"new_return_date"`
}

type UpdateFineRequest struct {
	LoanID     string  `json:"loan_id" binding:"required"`
	FineAmount float64 `json:"fine_amount" binding:"min=0"`
	FinePaid   bool    `json:"fine_paid"`
}

type LoanStatistics struct {
	TotalLoans       int64   `json:"total_loans"`
	ActiveLoans      int64   `json:"active_loans"`
	OverdueLoans     int64   `json:"overdue_loans"`
	ReturnedLoans    int64   `json:"returned_loans"`
	TotalFines       float64 `json:"total_fines"`
	CollectedFines   float64 `json:"collected_fines"`
	AverageLoadDays  float64 `json:"average_loan_days"`
}