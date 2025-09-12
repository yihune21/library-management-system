package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port        int
	Environment string
	APIPrefix   string
	APIVersion  string
	
	Database    DatabaseConfig
	Redis       RedisConfig
	JWT         JWTConfig
	CORS        CORSConfig
	RateLimit   RateLimitConfig
	Library     LibraryConfig
	Pagination  PaginationConfig
	
	LogLevel    string
	LogFormat   string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type JWTConfig struct {
	Secret              string
	AccessTokenExpiry   time.Duration
	RefreshTokenExpiry  time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

type RateLimitConfig struct {
	Enabled           bool
	RequestsPerMinute int
}

type LibraryConfig struct {
	MaxLoanDays        int
	MaxRenewals        int
	OverdueFinePerDay  float64
	MaxBooksPerMember  int
}

type PaginationConfig struct {
	DefaultPageSize int
	MaxPageSize     int
}

func Load() *Config {
	return &Config{
		Port:        getEnvAsInt("PORT", 8000),
		Environment: getEnv("ENVIRONMENT", "development"),
		APIPrefix:   getEnv("API_PREFIX", "/api"),
		APIVersion:  getEnv("API_VERSION", "v1"),
		
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "library_user"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "library_management"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnvAsInt("REDIS_PORT", 6379),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		
		JWT: JWTConfig{
			Secret:             getEnv("JWT_SECRET", "change-this-secret-in-production"),
			AccessTokenExpiry:  getEnvAsDuration("JWT_ACCESS_TOKEN_EXPIRY", 24*time.Hour),
			RefreshTokenExpiry: getEnvAsDuration("JWT_REFRESH_TOKEN_EXPIRY", 7*24*time.Hour),
		},
		
		CORS: CORSConfig{
			AllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:5173", "http://localhost:3000"}),
			AllowedMethods: getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
			AllowedHeaders: getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Origin", "Content-Type", "Accept", "Authorization"}),
		},
		
		RateLimit: RateLimitConfig{
			Enabled:           getEnvAsBool("RATE_LIMIT_ENABLED", true),
			RequestsPerMinute: getEnvAsInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 60),
		},
		
		Library: LibraryConfig{
			MaxLoanDays:       getEnvAsInt("MAX_LOAN_DAYS", 14),
			MaxRenewals:       getEnvAsInt("MAX_RENEWALS", 2),
			OverdueFinePerDay: getEnvAsFloat("OVERDUE_FINE_PER_DAY", 1.00),
			MaxBooksPerMember: getEnvAsInt("MAX_BOOKS_PER_MEMBER", 5),
		},
		
		Pagination: PaginationConfig{
			DefaultPageSize: getEnvAsInt("DEFAULT_PAGE_SIZE", 20),
			MaxPageSize:     getEnvAsInt("MAX_PAGE_SIZE", 100),
		},
		
		LogLevel:  getEnv("LOG_LEVEL", "info"),
		LogFormat: getEnv("LOG_FORMAT", "json"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsFloat(key string, defaultValue float64) float64 {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseFloat(valueStr, 64); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	return strings.Split(valueStr, ",")
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := getEnv(key, "")
	if value, err := time.ParseDuration(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func (c *Config) Validate() error {
	if c.JWT.Secret == "change-this-secret-in-production" && c.Environment == "production" {
		log.Fatal("JWT_SECRET must be changed in production")
	}
	
	if c.Database.Password == "" {
		log.Println("Warning: DB_PASSWORD is empty")
	}
	
	return nil
}