import apiClient from './client';

export const teacherApi = {
  getMySessions: async () => {
    const response = await apiClient.get('/teacher/my-sessions');
    return response.data;
  },
};
