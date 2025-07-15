// Books API
import apiClient from './client';

export const booksAPI = {
  // Get books with pagination and filters
  getBooks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        sort_by: params.sortBy || 'title',
        sort_order: params.sortOrder || 'asc',
        ...params.filters
      });

      const response = await apiClient.get(`/api/method/library_management.api.books.get_books?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books');
    }
  },

  // Get single book
  getBook: async (bookId) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.books.get_book?book_id=${bookId}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch book');
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.books.create_book', {
        book_data: bookData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create book');
    }
  },

  // Update book
  updateBook: async (bookId, bookData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.books.update_book', {
        book_id: bookId,
        book_data: bookData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update book');
    }
  },

  // Delete book
  deleteBook: async (bookId) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.books.delete_book', {
        book_id: bookId
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete book');
    }
  },

  // Get available books
  getAvailableBooks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || ''
      });

      const response = await apiClient.get(`/api/method/library_management.api.books.get_available_books?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available books');
    }
  },

  // Search books (for autocomplete)
  searchBooks: async (query, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.books.search_books?query=${query}&limit=${limit}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },

  // Reserve book
  reserveBook: async (bookId) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.books.reserve_book', {
        book_id: bookId
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reserve book');
    }
  },

  // Get book statistics
  getBookStatistics: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.books.get_book_statistics');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
};