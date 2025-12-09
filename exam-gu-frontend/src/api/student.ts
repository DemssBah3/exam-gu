import apiClient from './client';

export const studentApi = {
  getMyCourses: async () => {
    const response = await apiClient.get('/student/my-courses');
    return response.data;
  },
};
