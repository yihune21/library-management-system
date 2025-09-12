package middleware

import (
	"net/http"
	"strings"

	"github.com/library-management-system/server/internal/models"
	"github.com/library-management-system/server/pkg/auth"
	
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthRequired(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			c.Abort()
			return
		}
		
		claims, err := auth.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}
		
		var user models.User
		if err := db.First(&user, "id = ?", claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}
		
		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User account is inactive"})
			c.Abort()
			return
		}
		
		c.Set("user", &user)
		c.Set("user_id", user.ID.String())
		c.Set("user_role", string(user.Role))
		c.Next()
	}
}

func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}
		
		u, ok := user.(*models.User)
		if !ok || !u.IsAdmin() {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

func LibrarianRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}
		
		u, ok := user.(*models.User)
		if !ok || !u.IsLibrarian() {
			c.JSON(http.StatusForbidden, gin.H{"error": "Librarian access required"})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

func extractToken(c *gin.Context) string {
	bearerToken := c.GetHeader("Authorization")
	if len(strings.Split(bearerToken, " ")) == 2 {
		return strings.Split(bearerToken, " ")[1]
	}
	
	token := c.Query("token")
	if token != "" {
		return token
	}
	
	return ""
}

func GetCurrentUser(c *gin.Context) (*models.User, error) {
	user, exists := c.Get("user")
	if !exists {
		return nil, nil
	}
	
	u, ok := user.(*models.User)
	if !ok {
		return nil, nil
	}
	
	return u, nil
}