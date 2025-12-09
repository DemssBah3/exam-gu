import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentExamApi } from '../../api/studentExam';
import { 
  ArrowLeft,
  Clock,
  FileText,
  Award,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';

export function ExamStart() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInstructions, setShowInstructions] = useState(true);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['studentExam', examId],
    queryFn: () => studentExamApi.getExamById(examId!),
    enabled: !!examId,
  });

  const startExamMutation = useMutation({
    mutationFn: () => studentExamApi.startExam(examId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentExams'] });
      toast.success('Examen démarré !');
      navigate(`/student/exams/${examId}/attempt/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du démarrage');
    },
  });

  const handleStart = () => {
    if (confirm('Êtes-vous prêt à commencer l\'examen ? Le chronomètre démarrera immédiatement.')) {
      startExamMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de l'examen...</p>
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

  const now = new Date();
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);
  const isAvailable = now >= start && now <= end;
  const isUpcoming = now < start;
  const isExpired = now > end;

  const canStart = isAvailable && exam.attemptCount < exam.maxAttempts;

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
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-600 mt-1">
            {exam.course?.code} - {exam.course?.title}
          </p>
        </div>
      </div>

      {/* Statut */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Statut de l'Examen</h2>
          {isAvailable && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center gap-2">
              <CheckCircle size={16} />
              Disponible
            </span>
          )}
          {isUpcoming && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full flex items-center gap-2">
              <Clock size={16} />
              À venir
            </span>
          )}
          {isExpired && (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full flex items-center gap-2">
              <AlertCircle size={16} />
              Expiré
            </span>
          )}
        </div>

        {exam.description && (
          <p className="text-gray-600 mb-4">{exam.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText size={16} />
              <span className="text-sm">Questions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{exam.questionCount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award size={16} />
              <span className="text-sm">Points</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{exam.totalPoints}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock size={16} />
              <span className="text-sm">Durée</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{exam.duration} min</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <PlayCircle size={16} />
              <span className="text-sm">Tentatives</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {exam.attemptCount}/{exam.maxAttempts}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>
              Disponible du {new Date(exam.startTime).toLocaleString('fr-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {' au '}
              {new Date(exam.endTime).toLocaleString('fr-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions Importantes</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Une fois l'examen démarré, le chronomètre commence automatiquement.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Vous avez <strong>{exam.duration} minutes</strong> pour compléter l'examen.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Vos réponses sont sauvegardées automatiquement, mais pensez à cliquer sur "Sauvegarder" régulièrement.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Vous pouvez naviguer entre les questions et revenir en arrière.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    L'examen sera soumis automatiquement à la fin du temps imparti.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Vous avez droit à <strong>{exam.maxAttempts} tentative(s)</strong> au total.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>
                    Assurez-vous d'avoir une connexion internet stable pendant toute la durée de l'examen.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tentatives précédentes */}
      {exam.attempts && exam.attempts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos Tentatives</h2>
          <div className="space-y-3">
            {exam.attempts.map((attempt: any, index: number) => (
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
                    {attempt.status === 'SUBMITTED' && attempt.score !== null && (
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {attempt.score}/{exam.totalPoints}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round((attempt.score / exam.totalPoints) * 100)}%
                        </p>
                      </div>
                    )}
                    {attempt.status === 'IN_PROGRESS' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                        En cours
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {!canStart && isUpcoming && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Clock size={20} />
            <p className="font-semibold">
              Cet examen n'est pas encore disponible. Il commencera le{' '}
              {new Date(exam.startTime).toLocaleString('fr-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      )}

      {!canStart && isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <p className="font-semibold">
              Cet examen est expiré. La date limite était le{' '}
              {new Date(exam.endTime).toLocaleString('fr-CA', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      )}

      {!canStart && exam.attemptCount >= exam.maxAttempts && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertCircle size={20} />
            <p className="font-semibold">
              Vous avez atteint le nombre maximum de tentatives ({exam.maxAttempts}).
            </p>
          </div>
        </div>
      )}

      {/* Bouton démarrer */}
      {canStart && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                Tentative {exam.attemptCount + 1} sur {exam.maxAttempts}
              </p>
              <p className="text-sm text-gray-500">
                Assurez-vous d'être prêt avant de commencer
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={startExamMutation.isPending}
              className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <PlayCircle size={24} />
              {startExamMutation.isPending ? 'Démarrage...' : 'Commencer l\'Examen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
