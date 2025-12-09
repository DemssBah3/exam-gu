import apiClient from './client';

export interface CreateExamRequest {
  sessionId: string;
  title: string;
  description?: string;
  duration: number;
  startTime: string;
  endTime: string;
  maxAttempts?: number;
}

export interface CreateQuestionRequest {
  type: 'MCQ' | 'TRUE_FALSE' | 'OPEN_ENDED';
  text: string;
  points: number;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: boolean;
}

export const teacherExamApi = {
  // Examens
  getMyExams: async () => {
    const response = await apiClient.get('/teacher/exams');
    return response.data;
  },

  getExamById: async (examId: string) => {
    const response = await apiClient.get(`/teacher/exams/${examId}`);
    return response.data;
  },

  createExam: async (data: CreateExamRequest) => {
    const response = await apiClient.post('/teacher/exams', data);
    return response.data;
  },

  updateExam: async (examId: string, data: Partial<CreateExamRequest>) => {
    const response = await apiClient.put(`/teacher/exams/${examId}`, data);
    return response.data;
  },

  deleteExam: async (examId: string) => {
    const response = await apiClient.delete(`/teacher/exams/${examId}`);
    return response.data;
  },

  publishExam: async (examId: string) => {
    const response = await apiClient.post(`/teacher/exams/${examId}/publish`);
    return response.data;
  },

  // Questions
  addQuestion: async (examId: string, data: CreateQuestionRequest) => {
    const response = await apiClient.post(`/teacher/exams/${examId}/questions`, data);
    return response.data;
  },

  updateQuestion: async (examId: string, questionId: string, data: Partial<CreateQuestionRequest>) => {
    const response = await apiClient.put(`/teacher/exams/${examId}/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (examId: string, questionId: string) => {
    const response = await apiClient.delete(`/teacher/exams/${examId}/questions/${questionId}`);
    return response.data;
  },

  // Tentatives
  getExamAttempts: async (examId: string) => {
    const response = await apiClient.get(`/teacher/exams/${examId}/attempts`);
    return response.data;
  },
};
