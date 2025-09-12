package models

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin     UserRole = "admin"
	RoleLibrarian UserRole = "librarian"
	RoleMember    UserRole = "member"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	Password     string         `gorm:"not null" json:"-"`
	FullName     string         `gorm:"not null" json:"full_name"`
	Phone        string         `json:"phone"`
	Role         UserRole       `gorm:"type:varchar(20);not null;default:'member'" json:"role"`
	APIKey       string         `gorm:"uniqueIndex" json:"api_key,omitempty"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	LastLogin    *time.Time     `json:"last_login"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	
	Member       *Member        `gorm:"foreignKey:UserID" json:"member,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	
	if u.APIKey == "" {
		u.APIKey = uuid.New().String()
	}
	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

func (u *User) IsLibrarian() bool {
	return u.Role == RoleLibrarian || u.Role == RoleAdmin
}

func (u *User) IsMember() bool {
	return u.Role == RoleMember
}

type LoginRequest struct {
	Email    string `json:"usr" binding:"required,email"`
	Password string `json:"pwd" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Phone    string `json:"phone"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

type UserResponse struct {
	ID           string     `json:"id"`
	Email        string     `json:"email"`
	FullName     string     `json:"full_name"`
	Phone        string     `json:"phone"`
	Role         string     `json:"role"`
	APIKey       string     `json:"api_key,omitempty"`
	IsActive     bool       `json:"is_active"`
	MembershipID string     `json:"membership_id,omitempty"`
	LastLogin    *time.Time `json:"last_login"`
	CreatedAt    time.Time  `json:"created_at"`
}