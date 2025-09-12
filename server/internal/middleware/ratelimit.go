package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func RateLimit(client *redis.Client, limit int) gin.HandlerFunc {
	return func(c *gin.Context) {
		if client == nil {
			c.Next()
			return
		}
		
		ctx := c.Request.Context()
		key := fmt.Sprintf("rate_limit:%s:%s", c.ClientIP(), c.Request.URL.Path)
		
		pipe := client.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Minute)
		_, err := pipe.Exec(ctx)
		
		if err != nil {
			c.Next()
			return
		}
		
		count := incr.Val()
		
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", limit-int(count)))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Minute).Unix()))
		
		if count > int64(limit) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded",
				"retry_after": 60,
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}