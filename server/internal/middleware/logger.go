package middleware

import (
	"time"

	"github.com/library-management-system/server/pkg/logger"
	
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Logger(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery
		
		c.Next()
		
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		
		if raw != "" {
			path = path + "?" + raw
		}
		
		if statusCode >= 500 {
			log.Error("Request failed",
				"method", method,
				"path", path,
				"status", statusCode,
				"latency", latency,
				"ip", clientIP,
				"error", c.Errors.String(),
			)
		} else if statusCode >= 400 {
			log.Warn("Request error",
				"method", method,
				"path", path,
				"status", statusCode,
				"latency", latency,
				"ip", clientIP,
			)
		} else {
			log.Info("Request completed",
				"method", method,
				"path", path,
				"status", statusCode,
				"latency", latency,
				"ip", clientIP,
			)
		}
	}
}

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		
		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			
			switch err.Type {
			case gin.ErrorTypeBind:
				c.JSON(400, gin.H{
					"error": "Invalid request format",
					"details": err.Error(),
				})
			case gin.ErrorTypePublic:
				c.JSON(500, gin.H{
					"error": err.Error(),
				})
			default:
				c.JSON(500, gin.H{
					"error": "Internal server error",
				})
			}
		}
	}
}