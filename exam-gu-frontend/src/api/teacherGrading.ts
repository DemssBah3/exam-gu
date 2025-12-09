import apiClient from './client';

export interface GradeQuestionRequest {
  pointsAwarded: number;
  feedback?: string;
}

export const teacherGradingApi = {
  // Récupérer les détails pour correction
  getAttemptForGrading: async (examId: string, attemptId: string) => {
    const response = await apiClient.get(
      `/teacher/exams/${examId}/attempts/${attemptId}/grading`
    );
    return response.data;
  },

  // Corriger une question
  gradeQuestion: async (
    examId: string,
    attemptId: string,
    questionId: string,
    data: GradeQuestionRequest
  ) => {
    const response = await apiClient.put(
      `/teacher/exams/${examId}/attempts/${attemptId}/grading/${questionId}`,
      data
    );
    return response.data;
  },

  // Finaliser la correction
  finalizeGrading: async (examId: string, attemptId: string) => {
    const response = await apiClient.post(
      `/teacher/exams/${examId}/attempts/${attemptId}/grading/finalize`
    );
    return response.data;
  },
};
