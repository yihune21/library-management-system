package handlers

import (
	"net/http"
	"time"

	"github.com/library-management-system/server/internal/config"
	"github.com/library-management-system/server/internal/middleware"
	"github.com/library-management-system/server/internal/models"
	"github.com/library-management-system/server/pkg/auth"
	
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db     *gorm.DB
	config *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		db:     db,
		config: cfg,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is disabled"})
		return
	}
	
	token, err := auth.GenerateToken(
		user.ID.String(),
		user.Email,
		string(user.Role),
		h.config.JWT.AccessTokenExpiry,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	now := time.Now()
	user.LastLogin = &now
	h.db.Save(&user)
	
	var member *models.Member
	if user.Role == models.RoleMember {
		h.db.Where("user_id = ?", user.ID).First(&member)
	}
	
	response := gin.H{
		"message": gin.H{
			"user": gin.H{
				"id":            user.ID.String(),
				"email":         user.Email,
				"full_name":     user.FullName,
				"phone":         user.Phone,
				"role":          user.Role,
				"api_key":       user.APIKey,
				"is_active":     user.IsActive,
				"last_login":    user.LastLogin,
				"created_at":    user.CreatedAt,
			},
			"token": token,
		},
	}
	
	if member != nil {
		response["message"].(gin.H)["user"].(gin.H)["membership_id"] = member.MembershipID
	}
	
	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}
	
	user := models.User{
		ID:       uuid.New(),
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,
		Phone:    req.Phone,
		Role:     models.RoleMember,
		IsActive: true,
	}
	
	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	
	member := models.Member{
		ID:             uuid.New(),
		UserID:         user.ID,
		MembershipID:   "",
		MembershipType: models.MembershipBasic,
		JoinDate:       time.Now(),
		IsActive:       true,
	}
	member.MembershipID = member.GenerateMembershipID()
	
	if err := h.db.Create(&member).Error; err != nil {
		h.db.Delete(&user)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member profile"})
		return
	}
	
	token, _ := auth.GenerateToken(
		user.ID.String(),
		user.Email,
		string(user.Role),
		h.config.JWT.AccessTokenExpiry,
	)
	
	c.JSON(http.StatusCreated, gin.H{
		"message": gin.H{
			"user": gin.H{
				"id":            user.ID.String(),
				"email":         user.Email,
				"full_name":     user.FullName,
				"phone":         user.Phone,
				"role":          user.Role,
				"membership_id": member.MembershipID,
				"created_at":    user.CreatedAt,
			},
			"token": token,
		},
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	user, err := middleware.GetCurrentUser(c)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	
	var member *models.Member
	if user.Role == models.RoleMember {
		h.db.Where("user_id = ?", user.ID).First(&member)
	}
	
	response := gin.H{
		"message": gin.H{
			"id":         user.ID.String(),
			"email":      user.Email,
			"full_name":  user.FullName,
			"phone":      user.Phone,
			"role":       user.Role,
			"is_active":  user.IsActive,
			"last_login": user.LastLogin,
			"created_at": user.CreatedAt,
		},
	}
	
	if member != nil {
		response["message"].(gin.H)["membership_id"] = member.MembershipID
	}
	
	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	user, err := middleware.GetCurrentUser(c)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}
	
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}
	
	if err := h.db.Save(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}