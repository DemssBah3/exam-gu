import { useQuery } from '@tanstack/react-query';
import { studentExamApi } from '../api/studentExam';

export interface ExamResult {
  id: string;
  score: number;
  maxScore: number;
  isAvailable: boolean;
  questions: Array<{
    id: string;
    type: string;
    score: number;
    maxScore: number;
  }>;
}

export function useExamResults(examId: string, attemptId: string) {
  return useQuery<ExamResult>({
    queryKey: ['examResults', examId, attemptId],
    queryFn: () => studentExamApi.getAttemptResults(examId, attemptId),
    refetchInterval: 10000, // Poll every 10 seconds
    enabled: !!examId && !!attemptId,
  });
}
