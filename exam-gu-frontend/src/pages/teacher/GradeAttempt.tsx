import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherGradingApi } from '../../api/teacherGrading';
import type { GradeQuestionRequest } from '../../api/teacherGrading';
import { 
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText
} from 'lucide-react';

// Définir les types
interface Question {
  id: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'OPEN_ENDED';
  text: string;
  points: number;
  studentAnswer: any;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  feedback: string | null;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: boolean;
}

interface AttemptData {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  startTime: string;
  endTime?: string;
  gradedAt?: string;
  student: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  exam: {
    id: string;
    title: string;
    totalPoints: number;
  };
  questions: Question[];
  currentScore: number;
  totalPoints: number;
  allGraded: boolean;
}

export function GradeAttempt() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [grades, setGrades] = useState<Record<string, { points: number; feedback: string }>>({});

  const { data: attempt, isLoading } = useQuery<AttemptData>({
    queryKey: ['teacherGrading', examId, attemptId],
    queryFn: () => teacherGradingApi.getAttemptForGrading(examId!, attemptId!),
    enabled: !!examId && !!attemptId,
  });

  // Initialiser les grades quand les données arrivent
  useEffect(() => {
    if (attempt) {
      const initialGrades: Record<string, { points: number; feedback: string }> = {};
      attempt.questions?.forEach((q) => {
        if (q.type === 'OPEN_ENDED' && q.pointsAwarded !== null) {
          initialGrades[q.id] = {
            points: q.pointsAwarded,
            feedback: q.feedback || '',
          };
        }
      });
      setGrades(initialGrades);
    }
  }, [attempt]);

  const gradeQuestionMutation = useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: GradeQuestionRequest }) =>
      teacherGradingApi.gradeQuestion(examId!, attemptId!, questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherGrading', examId, attemptId] });
      toast.success('Note enregistrée');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    },
  });

  const finalizeGradingMutation = useMutation({
    mutationFn: () => teacherGradingApi.finalizeGrading(examId!, attemptId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherGrading', examId, attemptId] });
      queryClient.invalidateQueries({ queryKey: ['teacherExamAttempts', examId] });
      toast.success('Correction finalisée avec succès');
      navigate(`/teacher/exams/${examId}/grading`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la finalisation');
    },
  });

  const handleGradeChange = (questionId: string, field: 'points' | 'feedback', value: number | string) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: {
        points: field === 'points' ? (value as number) : (prev[questionId]?.points || 0),
        feedback: field === 'feedback' ? (value as string) : (prev[questionId]?.feedback || ''),
      },
    }));
  };

  const handleSaveGrade = (questionId: string, maxPoints: number) => {
    const grade = grades[questionId];
    if (!grade || grade.points === undefined || grade.points === null) {
      toast.error('Veuillez entrer une note');
      return;
    }

    if (grade.points < 0 || grade.points > maxPoints) {
      toast.error(`La note doit être entre 0 et ${maxPoints}`);
      return;
    }

    gradeQuestionMutation.mutate({
      questionId,
      data: {
        pointsAwarded: grade.points,
        feedback: grade.feedback || undefined,
      },
    });
  };

  const handleFinalize = () => {
    if (!attempt?.allGraded) {
      toast.error('Toutes les questions ouvertes doivent être corrigées avant de finaliser');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir finaliser la correction ? L\'étudiant pourra voir ses résultats.')) {
      finalizeGradingMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de la tentative...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Tentative non trouvée</p>
      </div>
    );
  }

  const openEndedQuestions = attempt.questions?.filter((q) => q.type === 'OPEN_ENDED') || [];
  const autoGradedQuestions = attempt.questions?.filter((q) => q.type !== 'OPEN_ENDED') || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/teacher/exams/${examId}/grading`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Correction de la Tentative</h1>
          <p className="text-gray-600 mt-1">{attempt.exam?.title}</p>
        </div>
        {attempt.status === 'SUBMITTED' && attempt.allGraded && (
          <button
            onClick={handleFinalize}
            disabled={finalizeGradingMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            <Send size={20} />
            {finalizeGradingMutation.isPending ? 'Finalisation...' : 'Finaliser la Correction'}
          </button>
        )}
      </div>

      {/* Info Étudiant */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={32} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {attempt.student?.firstName} {attempt.student?.lastName}
              </p>
              <p className="text-sm text-gray-600">{attempt.student?.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Soumis le {new Date(attempt.endTime || attempt.startTime).toLocaleString('fr-CA')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Score Actuel</p>
            <p className="text-3xl font-bold text-blue-600">
              {attempt.currentScore} / {attempt.totalPoints}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((attempt.currentScore / attempt.totalPoints) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Statut de correction */}
      {attempt.status === 'SUBMITTED' && (
        <div className={`rounded-lg border-2 p-4 ${
          attempt.allGraded 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {attempt.allGraded ? (
              <>
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-green-800 font-semibold">
                  Toutes les questions sont corrigées. Vous pouvez finaliser la correction.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-yellow-800 font-semibold">
                  {openEndedQuestions.filter((q) => q.pointsAwarded === null).length} question(s) ouverte(s) restent à corriger
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {attempt.status === 'GRADED' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <p className="text-blue-800 font-semibold">
              Cette tentative a déjà été corrigée et finalisée.
            </p>
          </div>
        </div>
      )}

      {/* Questions à correction automatique */}
      {autoGradedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              Questions à Correction Automatique ({autoGradedQuestions.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {autoGradedQuestions.map((question, index) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                        {question.type === 'MCQ' ? 'Choix Multiple' : 'Vrai/Faux'}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {question.points} point{question.points > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-3">{question.text}</p>
                  </div>
                  {question.isCorrect ? (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0" size={24} />
                  )}
                </div>

                {/* Réponse de l'étudiant */}
                {question.type === 'MCQ' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const isSelected = question.studentAnswer === option.id;
                      const isCorrect = option.isCorrect;
                      
                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect && isSelected
                              ? 'bg-green-50 border-green-500'
                              : isCorrect
                              ? 'bg-green-50 border-green-300'
                              : isSelected
                              ? 'bg-red-50 border-red-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect && <CheckCircle className="text-green-600" size={16} />}
                            {isSelected && !isCorrect && <XCircle className="text-red-600" size={16} />}
                            <span className={`${
                              isCorrect ? 'text-green-900 font-medium' : 
                              isSelected ? 'text-red-900 font-medium' : 
                              'text-gray-700'
                            }`}>
                              {option.text}
                            </span>
                            {isSelected && <span className="text-xs text-gray-600">(Réponse de l'étudiant)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.type === 'TRUE_FALSE' && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg border-2 ${
                      question.correctAnswer === true && question.studentAnswer === true
                        ? 'bg-green-50 border-green-500'
                        : question.correctAnswer === true
                        ? 'bg-green-50 border-green-300'
                        : question.studentAnswer === true
                        ? 'bg-red-50 border-red-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {question.correctAnswer === true && <CheckCircle className="text-green-600" size={16} />}
                        {question.studentAnswer === true && question.correctAnswer !== true && <XCircle className="text-red-600" size={16} />}
                        <span className="font-medium">Vrai</span>
                        {question.studentAnswer === true && <span className="text-xs text-gray-600">(Réponse de l'étudiant)</span>}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border-2 ${
                      question.correctAnswer === false && question.studentAnswer === false
                        ? 'bg-green-50 border-green-500'
                        : question.correctAnswer === false
                        ? 'bg-green-50 border-green-300'
                        : question.studentAnswer === false
                        ? 'bg-red-50 border-red-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {question.correctAnswer === false && <CheckCircle className="text-green-600" size={16} />}
                        {question.studentAnswer === false && question.correctAnswer !== false && <XCircle className="text-red-600" size={16} />}
                        <span className="font-medium">Faux</span>
                        {question.studentAnswer === false && <span className="text-xs text-gray-600">(Réponse de l'étudiant)</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Score */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Points obtenus</span>
                    <span className={`text-lg font-bold ${
                      question.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {question.pointsAwarded} / {question.points}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions ouvertes à corriger */}
      {openEndedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="text-orange-600" size={20} />
              Questions Ouvertes à Corriger ({openEndedQuestions.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {openEndedQuestions.map((question, index) => {
              const grade = grades[question.id] || { points: question.pointsAwarded || 0, feedback: question.feedback || '' };
              const isGraded = question.pointsAwarded !== null;

              return (
                <div key={question.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                          Question {autoGradedQuestions.length + index + 1}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                          Question Ouverte
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {question.points} point{question.points > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-3">{question.text}</p>
                    </div>
                    {isGraded && (
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                    )}
                  </div>

                  {/* Réponse de l'étudiant */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Réponse de l'étudiant :</p>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {question.studentAnswer || <span className="text-gray-400 italic">Aucune réponse</span>}
                      </p>
                    </div>
                  </div>

                  {/* Formulaire de correction */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points attribués <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={question.points}
                          step="0.5"
                          value={grade.points}
                          onChange={(e) => handleGradeChange(question.id, 'points', parseFloat(e.target.value))}
                          disabled={attempt.status === 'GRADED'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          placeholder={`0 - ${question.points}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum : {question.points} points
                        </p>
                      </div>
                      <div className="flex items-end">
                        {attempt.status !== 'GRADED' && (
                          <button
                            onClick={() => handleSaveGrade(question.id, question.points)}
                            disabled={gradeQuestionMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                          >
                            <Save size={16} />
                            {gradeQuestionMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire (optionnel)
                      </label>
                      <textarea
                        value={grade.feedback}
                        onChange={(e) => handleGradeChange(question.id, 'feedback', e.target.value)}
                        disabled={attempt.status === 'GRADED'}
                        rows={3}
                        placeholder="Ajoutez un commentaire pour l'étudiant..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Afficher le feedback existant si déjà corrigé */}
                  {isGraded && question.feedback && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Commentaire enregistré :</p>
                      <p className="text-sm text-blue-800">{question.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
