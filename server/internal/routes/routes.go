package routes

import (
	"github.com/library-management-system/server/internal/config"
	"github.com/library-management-system/server/internal/handlers"
	"github.com/library-management-system/server/internal/middleware"
	"github.com/library-management-system/server/pkg/auth"
	"github.com/library-management-system/server/pkg/logger"
	
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func Setup(router *gin.RouterGroup, db *gorm.DB, redis *redis.Client, cfg *config.Config, log *logger.Logger) {
	auth.InitJWT(cfg.JWT.Secret)
	
	authHandler := handlers.NewAuthHandler(db, cfg)
	bookHandler := handlers.NewBookHandler(db, cfg)
	
	method := router.Group("/method")
	{
		authRoutes := method.Group("/library_management.api.auth")
		{
			authRoutes.POST("/login", authHandler.Login)
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/logout", authHandler.Logout)
			authRoutes.GET("/get_current_user", middleware.AuthRequired(db), authHandler.GetCurrentUser)
			authRoutes.POST("/change_password", middleware.AuthRequired(db), authHandler.ChangePassword)
		}
		
		bookRoutes := method.Group("/library_management.api.books")
		{
			bookRoutes.GET("/get_books", bookHandler.GetBooks)
			bookRoutes.GET("/get_book", bookHandler.GetBook)
			bookRoutes.GET("/get_available_books", bookHandler.GetAvailableBooks)
			bookRoutes.GET("/search_books", bookHandler.SearchBooks)
			bookRoutes.GET("/get_book_statistics", middleware.AuthRequired(db), middleware.LibrarianRequired(), bookHandler.GetBookStatistics)
			
			bookRoutes.POST("/create_book", middleware.AuthRequired(db), middleware.LibrarianRequired(), bookHandler.CreateBook)
			bookRoutes.POST("/update_book", middleware.AuthRequired(db), middleware.LibrarianRequired(), bookHandler.UpdateBook)
			bookRoutes.POST("/delete_book", middleware.AuthRequired(db), middleware.AdminRequired(), bookHandler.DeleteBook)
			bookRoutes.POST("/reserve_book", middleware.AuthRequired(db), bookHandler.ReserveBook)
		}
	}
}