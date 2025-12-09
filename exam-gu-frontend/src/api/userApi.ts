import apiClient from './client';

export const userApi = {
  // Get current user profile
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Get login history
  getLoginHistory: async () => {
    const response = await apiClient.get('/auth/login-history');
    return response.data?.data || response.data || [];
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, data: any) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
