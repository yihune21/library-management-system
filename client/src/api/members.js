// Members API
import apiClient from './client';

export const membersAPI = {
  // Get members with pagination and filters
  getMembers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || '',
        sort_by: params.sortBy || 'full_name',
        sort_order: params.sortOrder || 'asc',
        ...params.filters
      });

      const response = await apiClient.get(`/api/method/library_management.api.members.get_members?${queryParams}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch members');
    }
  },

  // Get single member
  getMember: async (memberId) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.members.get_member?member_id=${memberId}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  },

  // Create new member
  createMember: async (memberData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.members.create_member', {
        member_data: memberData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create member');
    }
  },

  // Update member
  updateMember: async (memberId, memberData) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.members.update_member', {
        member_id: memberId,
        member_data: memberData
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update member');
    }
  },

  // Delete member
  deleteMember: async (memberId) => {
    try {
      const response = await apiClient.post('/api/method/library_management.api.members.delete_member', {
        member_id: memberId
      });
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete member');
    }
  },

  // Search members (for autocomplete)
  searchMembers: async (query, limit = 10) => {
    try {
      const response = await apiClient.get(`/api/method/library_management.api.members.search_members?query=${query}&limit=${limit}`);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },

  // Get current member details
  getCurrentMemberDetails: async () => {
    try {
      const response = await apiClient.get('/api/method/library_management.api.members.get_current_member_details');
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member details');
    }
  },

  // Get member loan history
  getMemberLoanHistory: async (memberId = null) => {
    try {
      const url = memberId 
        ? `/api/method/library_management.api.members.get_member_loan_history?member_id=${memberId}`
        : '/api/method/library_management.api.members.get_member_loan_history';
      
      const response = await apiClient.get(url);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch loan history');
    }
  },

  // Get member reservations
  getMemberReservations: async (memberId = null) => {
    try {
      const url = memberId 
        ? `/api/method/library_management.api.members.get_member_reservations?member_id=${memberId}`
        : '/api/method/library_management.api.members.get_member_reservations';
      
      const response = await apiClient.get(url);
      return response.data.message;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reservations');
    }
  }
};