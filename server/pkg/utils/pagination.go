package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func GetPaginationParams(c *gin.Context, defaultLimit, maxLimit int) (page, limit, offset int) {
	page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ = strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
	
	if page < 1 {
		page = 1
	}
	
	if limit < 1 {
		limit = defaultLimit
	}
	
	if limit > maxLimit {
		limit = maxLimit
	}
	
	offset = (page - 1) * limit
	return
}

func CalculatePagination(page, limit int, total int64) Pagination {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	return Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}