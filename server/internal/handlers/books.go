package handlers

import (
	"net/http"
	"strconv"

	"github.com/library-management-system/server/internal/config"
	"github.com/library-management-system/server/internal/middleware"
	"github.com/library-management-system/server/internal/models"
	"github.com/library-management-system/server/pkg/utils"
	
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BookHandler struct {
	db     *gorm.DB
	config *config.Config
}

func NewBookHandler(db *gorm.DB, cfg *config.Config) *BookHandler {
	return &BookHandler{
		db:     db,
		config: cfg,
	}
}

func (h *BookHandler) GetBooks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(h.config.Pagination.DefaultPageSize)))
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort_by", "title")
	sortOrder := c.DefaultQuery("sort_order", "asc")
	
	if limit > h.config.Pagination.MaxPageSize {
		limit = h.config.Pagination.MaxPageSize
	}
	
	offset := (page - 1) * limit
	
	query := h.db.Model(&models.Book{})
	
	if search != "" {
		query = query.Where("title ILIKE ? OR author ILIKE ? OR isbn ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	var total int64
	query.Count(&total)
	
	var books []models.Book
	query.Order(sortBy + " " + sortOrder).
		Limit(limit).
		Offset(offset).
		Find(&books)
	
	bookResponses := make([]models.BookResponse, len(books))
	for i, book := range books {
		bookResponses[i] = h.bookToResponse(book)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": gin.H{
			"books": bookResponses,
			"pagination": gin.H{
				"page":       page,
				"limit":      limit,
				"total":      total,
				"totalPages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *BookHandler) GetBook(c *gin.Context) {
	bookID := c.Query("book_id")
	if bookID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book ID required"})
		return
	}
	
	var book models.Book
	if err := h.db.First(&book, "id = ?", bookID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": h.bookToResponse(book),
	})
}

func (h *BookHandler) CreateBook(c *gin.Context) {
	var req struct {
		BookData models.BookRequest `json:"book_data"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	book := models.Book{
		ID:              uuid.New(),
		Title:           req.BookData.Title,
		Author:          req.BookData.Author,
		ISBN:            req.BookData.ISBN,
		Publisher:       req.BookData.Publisher,
		PublishDate:     req.BookData.PublishDate,
		Category:        req.BookData.Category,
		Description:     req.BookData.Description,
		CoverImage:      req.BookData.CoverImage,
		TotalCopies:     req.BookData.TotalCopies,
		AvailableCopies: req.BookData.AvailableCopies,
		Location:        req.BookData.Location,
		Status:          models.BookStatusAvailable,
		Tags:            req.BookData.Tags,
	}
	
	if book.AvailableCopies == 0 {
		book.AvailableCopies = book.TotalCopies
	}
	
	if err := h.db.Create(&book).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message": h.bookToResponse(book),
	})
}

func (h *BookHandler) UpdateBook(c *gin.Context) {
	var req struct {
		BookID   string             `json:"book_id"`
		BookData models.BookRequest `json:"book_data"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	var book models.Book
	if err := h.db.First(&book, "id = ?", req.BookID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	
	updates := map[string]interface{}{
		"title":            req.BookData.Title,
		"author":           req.BookData.Author,
		"isbn":             req.BookData.ISBN,
		"publisher":        req.BookData.Publisher,
		"publish_date":     req.BookData.PublishDate,
		"category":         req.BookData.Category,
		"description":      req.BookData.Description,
		"cover_image":      req.BookData.CoverImage,
		"total_copies":     req.BookData.TotalCopies,
		"available_copies": req.BookData.AvailableCopies,
		"location":         req.BookData.Location,
		"tags":             req.BookData.Tags,
	}
	
	if err := h.db.Model(&book).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": h.bookToResponse(book),
	})
}

func (h *BookHandler) DeleteBook(c *gin.Context) {
	var req struct {
		BookID string `json:"book_id"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	var activeLoans int64
	h.db.Model(&models.Loan{}).Where("book_id = ? AND status = ?", req.BookID, models.LoanStatusActive).Count(&activeLoans)
	
	if activeLoans > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete book with active loans"})
		return
	}
	
	if err := h.db.Delete(&models.Book{}, "id = ?", req.BookID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete book"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Book deleted successfully",
	})
}

func (h *BookHandler) GetAvailableBooks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(h.config.Pagination.DefaultPageSize)))
	search := c.Query("search")
	
	offset := (page - 1) * limit
	
	query := h.db.Model(&models.Book{}).Where("available_copies > 0 AND status = ?", models.BookStatusAvailable)
	
	if search != "" {
		query = query.Where("title ILIKE ? OR author ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	var total int64
	query.Count(&total)
	
	var books []models.Book
	query.Order("title ASC").
		Limit(limit).
		Offset(offset).
		Find(&books)
	
	bookResponses := make([]models.BookResponse, len(books))
	for i, book := range books {
		bookResponses[i] = h.bookToResponse(book)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": gin.H{
			"books": bookResponses,
			"pagination": gin.H{
				"page":       page,
				"limit":      limit,
				"total":      total,
				"totalPages": (total + int64(limit) - 1) / int64(limit),
			},
		},
	})
}

func (h *BookHandler) SearchBooks(c *gin.Context) {
	query := c.Query("query")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}
	
	var books []models.Book
	h.db.Where("title ILIKE ? OR author ILIKE ? OR isbn ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%").
		Limit(limit).
		Find(&books)
	
	bookResponses := make([]models.BookResponse, len(books))
	for i, book := range books {
		bookResponses[i] = h.bookToResponse(book)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": bookResponses,
	})
}

func (h *BookHandler) ReserveBook(c *gin.Context) {
	var req struct {
		BookID string `json:"book_id"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}
	
	user, _ := middleware.GetCurrentUser(c)
	if user == nil || user.Role != models.RoleMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only members can reserve books"})
		return
	}
	
	var member models.Member
	if err := h.db.Where("user_id = ?", user.ID).First(&member).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member profile not found"})
		return
	}
	
	var book models.Book
	if err := h.db.First(&book, "id = ?", req.BookID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	
	if book.IsAvailable() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book is available for immediate loan"})
		return
	}
	
	var existingReservation models.Reservation
	err := h.db.Where("book_id = ? AND member_id = ? AND status = ?",
		book.ID, member.ID, models.ReservationStatusPending).First(&existingReservation).Error
	
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You already have a pending reservation for this book"})
		return
	}
	
	var queuePosition int64
	h.db.Model(&models.Reservation{}).
		Where("book_id = ? AND status = ?", book.ID, models.ReservationStatusPending).
		Count(&queuePosition)
	
	reservation := models.Reservation{
		ID:            uuid.New(),
		BookID:        book.ID,
		MemberID:      member.ID,
		Status:        models.ReservationStatusPending,
		QueuePosition: int(queuePosition) + 1,
	}
	
	if err := h.db.Create(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reservation"})
		return
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message": gin.H{
			"reservation_id": reservation.ID.String(),
			"queue_position": reservation.QueuePosition,
			"expiry_date":    reservation.ExpiryDate,
		},
	})
}

func (h *BookHandler) GetBookStatistics(c *gin.Context) {
	var stats models.BookStatistics
	
	h.db.Model(&models.Book{}).Count(&stats.TotalBooks)
	h.db.Model(&models.Book{}).Where("status = ?", models.BookStatusAvailable).Count(&stats.AvailableBooks)
	h.db.Model(&models.Book{}).Where("status = ?", models.BookStatusLoaned).Count(&stats.LoanedBooks)
	h.db.Model(&models.Book{}).Where("status = ?", models.BookStatusReserved).Count(&stats.ReservedBooks)
	h.db.Model(&models.Book{}).Where("status = ?", models.BookStatusLost).Count(&stats.LostBooks)
	h.db.Model(&models.Book{}).Where("status = ?", models.BookStatusDamaged).Count(&stats.DamagedBooks)
	
	h.db.Model(&models.Book{}).Select("SUM(total_copies)").Scan(&stats.TotalCopies)
	h.db.Model(&models.Book{}).Select("SUM(available_copies)").Scan(&stats.AvailableCopies)
	
	c.JSON(http.StatusOK, gin.H{
		"message": stats,
	})
}

func (h *BookHandler) bookToResponse(book models.Book) models.BookResponse {
	response := models.BookResponse{
		ID:              book.ID.String(),
		Title:           book.Title,
		Author:          book.Author,
		ISBN:            book.ISBN,
		Publisher:       book.Publisher,
		PublishDate:     book.PublishDate,
		Category:        book.Category,
		Description:     book.Description,
		CoverImage:      book.CoverImage,
		TotalCopies:     book.TotalCopies,
		AvailableCopies: book.AvailableCopies,
		Location:        book.Location,
		Status:          string(book.Status),
		Tags:            book.Tags,
		IsAvailable:     book.IsAvailable(),
		CreatedAt:       book.CreatedAt,
	}
	
	var currentLoan models.Loan
	if err := h.db.Where("book_id = ? AND status = ?", book.ID, models.LoanStatusActive).
		First(&currentLoan).Error; err == nil {
		loanID := currentLoan.ID.String()
		response.CurrentLoanID = &loanID
	}
	
	var reservations []models.Reservation
	h.db.Where("book_id = ? AND status = ?", book.ID, models.ReservationStatusPending).
		Order("queue_position ASC").Find(&reservations)
	
	if len(reservations) > 0 {
		response.ReservationIDs = make([]string, len(reservations))
		for i, r := range reservations {
			response.ReservationIDs[i] = r.ID.String()
		}
	}
	
	return response
}