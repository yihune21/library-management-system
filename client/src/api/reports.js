// Reports API
import apiClient from './client';

export const reportsAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.reports.get_dashboard_stats');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  // Get books on loan report
  getBooksOnLoanReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sort_by: params.sortBy || 'loan_date',
        sort_order: params.sortOrder || 'desc'
      });

      const response = await apiClient.get(`/api/method/library_management.api.reports.get_books_on_loan_report?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch books on loan report');
    }
  },

  // Get overdue books report
  getOverdueBooksReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sort_by: params.sortBy || 'return_date',
        sort_order: params.sortOrder || 'asc'
      });

      const response = await apiClient.get(`/api/method/library_management.api.reports.get_overdue_books_report?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overdue books report');
    }
  },

  // Get popular books report
  getPopularBooksReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        period: params.period || 'all'
      });

      const response = await apiClient.get(`/api/method/library_management.api.reports.get_popular_books_report?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular books report');
    }
  },

  // Get member activity report
  getMemberActivityReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sort_by: params.sortBy || 'loan_count',
        sort_order: params.sortOrder || 'desc'
      });

      const response = await apiClient.get(`/api/method/library_management.api.reports.get_member_activity_report?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member activity report');
    }
  },

  // Get reservation report
  getReservationReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status || 'all'
      });

      const response = await apiClient.get(`/api/method/library_management.api.reports.get_reservation_report?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservation report');
    }
  },

  // Export report as CSV
  exportReport: async (reportType, filters = {}) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.reports.export_report?report_type=${reportType}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { message: 'Report exported successfully' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export report');
    }
  }
};