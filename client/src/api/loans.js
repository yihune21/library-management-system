// Loans API
import apiClient from './client';

export const loansAPI = {
  // Get loans with pagination and filters
  getLoans: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        sort_by: params.sortBy || 'loan_date',
        sort_order: params.sortOrder || 'desc',
        ...params.filters
      });

      const response = await apiClient.get(`/api/method/library_management.api.loans.get_loans?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loans');
    }
  },

  // Get single loan
  getLoan: async (loanId) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.loans.get_loan?loan_id=${loanId}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loan');
    }
  },

  // Create new loan
  createLoan: async (loanData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.loans.create_loan', {
        loan_data: loanData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create loan');
    }
  },

  // Return book
  returnBook: async (loanId, actualReturnDate = null) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.loans.return_book', {
        loan_id: loanId,
        actual_return_date: actualReturnDate
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to return book');
    }
  },

  // Renew loan
  renewLoan: async (loanId, newReturnDate = null) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.loans.renew_loan', {
        loan_id: loanId,
        new_return_date: newReturnDate
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to renew loan');
    }
  },

  // Get active loans
  getActiveLoans: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.loans.get_active_loans');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active loans');
    }
  },

  // Get overdue loans
  getOverdueLoans: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.loans.get_overdue_loans');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue loans');
    }
  },

  // Get my loans (for current user)
  getMyLoans: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status || ''
      });

      const response = await apiClient.get(`/api/method/library_management.api.loans.get_my_loans?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loans');
    }
  },

  // Bulk return books
  bulkReturnBooks: async (loanIds) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.loans.bulk_return_books', {
        loan_ids: loanIds
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to return books');
    }
  },

  // Update loan fine
  updateLoanFine: async (loanId, fineAmount, finePaid = false) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.loans.update_loan_fine', {
        loan_id: loanId,
        fine_amount: fineAmount,
        fine_paid: finePaid
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update fine');
    }
  }
};