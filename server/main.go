package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/library-management-system/server/internal/config"
	"github.com/library-management-system/server/internal/database"
	"github.com/library-management-system/server/internal/middleware"
	"github.com/library-management-system/server/internal/routes"
	"github.com/library-management-system/server/pkg/logger"
	"github.com/library-management-system/server/pkg/redis"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	cfg := config.Load()
	
	appLogger := logger.New(cfg.LogLevel, cfg.LogFormat)
	appLogger.Info("Starting Library Management System Server...")

	db, err := database.Connect(cfg.Database)
	if err != nil {
		appLogger.Fatal("Failed to connect to database", "error", err)
	}

	if err := database.Migrate(db); err != nil {
		appLogger.Fatal("Failed to run database migrations", "error", err)
	}

	redisClient, err := redis.Connect(cfg.Redis)
	if err != nil {
		appLogger.Warn("Failed to connect to Redis, caching disabled", "error", err)
	}

	if cfg.Environment == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(appLogger))
	router.Use(middleware.RequestID())
	
	corsConfig := cors.Config{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     cfg.CORS.AllowedMethods,
		AllowHeaders:     cfg.CORS.AllowedHeaders,
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(corsConfig))

	if cfg.RateLimit.Enabled {
		router.Use(middleware.RateLimit(redisClient, cfg.RateLimit.RequestsPerMinute))
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().Unix(),
		})
	})

	api := router.Group(cfg.APIPrefix)
	routes.Setup(api, db, redisClient, cfg, appLogger)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		appLogger.Info("Server started", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Fatal("Failed to start server", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		appLogger.Error("Server forced to shutdown", "error", err)
	}

	if redisClient != nil {
		if err := redisClient.Close(); err != nil {
			appLogger.Error("Failed to close Redis connection", "error", err)
		}
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.Close()
	}

	appLogger.Info("Server shutdown complete")
}