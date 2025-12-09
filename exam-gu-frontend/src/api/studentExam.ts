import apiClient from './client';

export interface StartExamResponse {
  id: string;
  examId: string;
  studentId: string;
  status: string;
  startTime: string;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOption?: string;          // ✅ Une seule réponse (QCM simple)
  selectedOptions?: string[];       // ✅ NOUVEAU: Plusieurs réponses (QCM multiple)
  booleanAnswer?: boolean;
  textAnswer?: string;
}

export const studentExamApi = {
  // Examens disponibles
  getMyExams: async () => {
    const response = await apiClient.get('/student/exams');
    return response.data;
  },

  getExamById: async (examId: string) => {
    const response = await apiClient.get(`/student/exams/${examId}`);
    return response.data;
  },

  // Démarrer un examen
  startExam: async (examId: string) => {
    const response = await apiClient.post(`/student/exams/${examId}/start`);
    return response.data;
  },

  // Tentative en cours
  getAttempt: async (examId: string, attemptId: string) => {
    const response = await apiClient.get(`/student/exams/${examId}/attempts/${attemptId}`);
    return response.data;
  },

  // Sauvegarder une réponse
  saveAnswer: async (examId: string, attemptId: string, data: SaveAnswerRequest) => {
    const response = await apiClient.post(
      `/student/exams/${examId}/attempts/${attemptId}/answers`,
      data
    );
    return response.data;
  },

  // Soumettre l'examen
  submitExam: async (examId: string, attemptId: string) => {
    const response = await apiClient.post(
      `/student/exams/${examId}/attempts/${attemptId}/submit`
    );
    return response.data;
  },
};
