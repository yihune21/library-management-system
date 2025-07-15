// Reservations API
import apiClient from './client';

export const reservationsAPI = {
  // Get reservations with pagination and filters
  getReservations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        sort_by: params.sortBy || 'reservation_date',
        sort_order: params.sortOrder || 'desc',
        ...params.filters
      });

      const response = await apiClient.get(`/api/method/library_management.api.reservations.get_reservations?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservations');
    }
  },

  // Get single reservation
  getReservation: async (reservationId) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.reservations.get_reservation?reservation_id=${reservationId}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservation');
    }
  },

  // Create new reservation
  createReservation: async (reservationData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.reservations.create_reservation', {
        reservation_data: reservationData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create reservation');
    }
  },

  // Cancel reservation
  cancelReservation: async (reservationId, reason = null) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.reservations.cancel_reservation', {
        reservation_id: reservationId,
        reason: reason
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  },

  // Get my reservations (for current user)
  getMyReservations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status || ''
      });

      const response = await apiClient.get(`/api/method/library_management.api.reservations.get_my_reservations?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservations');
    }
  },

  // Get book reservation queue
  getBookReservationQueue: async (bookId) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.reservations.get_book_reservation_queue?book_id=${bookId}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservation queue');
    }
  },

  // Fulfill reservation (librarian only)
  fulfillReservation: async (reservationId) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.reservations.fulfill_reservation', {
        reservation_id: reservationId
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fulfill reservation');
    }
  },

  // Notify reservation available (librarian only)
  notifyReservationAvailable: async (reservationId) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.reservations.notify_reservation_available', {
        reservation_id: reservationId
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to notify member');
    }
  }
};