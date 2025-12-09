import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentExamApi } from '../../api/studentExam';
import { 
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useEffect } from 'react';

export function ExamResults() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // 🔑 Récupère les données passées en state (score immédiat après soumission)
  const stateScore = location.state as { score?: number; maxScore?: number };

  // 🔑 Force un refetch immédiat de l'examen pour avoir les données à jour
  useEffect(() => {
    // Invalide la query pour forcer un refetch
    queryClient.invalidateQueries({ 
      queryKey: ['studentExam', examId] 
    });
  }, [examId, queryClient]);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['studentExam', examId],
    queryFn: () => studentExamApi.getExamById(examId!),
    enabled: !!examId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Examen non trouvé</p>
      </div>
    );
  }

  // 🔑 Utilise le score du state SI disponible (immédiat après soumission)
  // Sinon, utilise celui de la dernière tentative soumise
  const completedAttempts = exam.attempts?.filter((a: any) => a.status === 'SUBMITTED') || [];
  const latestAttempt = completedAttempts[completedAttempts.length - 1];
  
  const score = stateScore?.score !== undefined ? stateScore.score : latestAttempt?.score;
  const maxScore = stateScore?.maxScore !== undefined ? stateScore.maxScore : exam.totalPoints;
  const percentage = score !== null && score !== undefined ? Math.round((score / maxScore) * 100) : null;

  console.log('📊 ExamResults Debug:');
  console.log('Score from state:', stateScore?.score);
  console.log('Score from DB:', latestAttempt?.score);
  console.log('Final score:', score);
  console.log('Attempts:', completedAttempts);

  const getGradeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-blue-600';
    if (percent >= 70) return 'text-yellow-600';
    if (percent >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBg = (percent: number) => {
    if (percent >= 90) return 'bg-green-50 border-green-200';
    if (percent >= 80) return 'bg-blue-50 border-blue-200';
    if (percent >= 70) return 'bg-yellow-50 border-yellow-200';
    if (percent >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Résultats de l'Examen</h1>
          <p className="text-gray-600 mt-1">{exam.title}</p>
        </div>
      </div>

      {/* Score principal */}
      {percentage !== null && (
        <div className={`rounded-lg border-2 p-8 ${getGradeBg(percentage)}`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className={getGradeColor(percentage)} size={48} />
            </div>
            <h2 className="text-6xl font-bold mb-2" style={{ color: getGradeColor(percentage).replace('text-', '') }}>
              {percentage}%
            </h2>
            <p className="text-2xl font-semibold text-gray-900 mb-2">
              {score} / {maxScore} points
            </p>
            <p className="text-gray-600">
              {percentage >= 60 ? 'Félicitations ! Vous avez réussi l\'examen.' : 'Vous n\'avez pas atteint le seuil de réussite.'}
            </p>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Questions</span>
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{exam.questionCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tentatives</span>
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {completedAttempts.length} / {exam.maxAttempts}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Durée</span>
            <Award className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{exam.duration} min</p>
        </div>
      </div>

      {/* Historique des tentatives */}
      {completedAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des Tentatives</h2>
          <div className="space-y-3">
            {completedAttempts.map((attempt: any, index: number) => {
              const attemptPercent = Math.round((attempt.score / maxScore) * 100);
              return (
                <div key={attempt.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Tentative {index + 1}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.startTime).toLocaleString('fr-CA', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getGradeColor(attemptPercent)}`}>
                        {attempt.score}/{maxScore}
                      </p>
                      <p className="text-sm text-gray-600">{attemptPercent}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message si tentatives restantes */}
      {exam.attemptCount < exam.maxAttempts && percentage !== null && percentage < 60 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold">
                Vous pouvez repasser cet examen
              </p>
              <p className="text-sm">
                Il vous reste {exam.maxAttempts - exam.attemptCount} tentative(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/student/exams')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Retour aux Examens
        </button>
        {exam.attemptCount < exam.maxAttempts && (
          <button
            onClick={() => navigate(`/student/exams/${examId}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Repasser l'Examen
          </button>
        )}
      </div>
    </div>
  );
}
