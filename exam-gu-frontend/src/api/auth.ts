import apiClient from './client';
import type  { LoginRequest, LoginResponse, User, LoginLog } from '../types';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  // Get login history
  getLoginHistory: async (): Promise<LoginLog[]> => {
    const response = await apiClient.get<LoginLog[]>('/auth/login-history');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
