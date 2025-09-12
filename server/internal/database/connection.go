package database

import (
	"fmt"
	"log"
	"time"

	"github.com/library-management-system/server/internal/config"
	"github.com/library-management-system/server/internal/models"
	
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=UTC",
		cfg.Host, cfg.User, cfg.Password, cfg.Name, cfg.Port, cfg.SSLMode,
	)
	
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
		PrepareStmt: true,
	}
	
	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}
	
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	
	log.Println("Successfully connected to database")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&models.User{},
		&models.Member{},
		&models.Book{},
		&models.Loan{},
		&models.Reservation{},
	)
	
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	
	if err := createIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}
	
	if err := seedInitialData(db); err != nil {
		log.Printf("Warning: failed to seed initial data: %v", err)
	}
	
	log.Println("Database migration completed successfully")
	return nil
}

func createIndexes(db *gorm.DB) error {
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_books_title_author ON books(title, author)",
		"CREATE INDEX IF NOT EXISTS idx_loans_status_due_date ON loans(status, due_date)",
		"CREATE INDEX IF NOT EXISTS idx_members_membership_id ON members(membership_id)",
		"CREATE INDEX IF NOT EXISTS idx_reservations_status_book ON reservations(status, book_id)",
		"CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active)",
	}
	
	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			return err
		}
	}
	
	return nil
}

func seedInitialData(db *gorm.DB) error {
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount)
	
	if adminCount == 0 {
		admin := &models.User{
			Email:    "admin@library.com",
			Password: "admin123",
			FullName: "System Administrator",
			Role:     models.RoleAdmin,
			IsActive: true,
		}
		
		if err := db.Create(admin).Error; err != nil {
			return err
		}
		
		log.Println("Created default admin user: admin@library.com / admin123")
		log.Println("WARNING: Please change the default admin password immediately!")
	}
	
	return nil
}