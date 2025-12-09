import { useQuery } from '@tanstack/react-query';
import { studentExamApi } from '../../api/studentExam';
import { 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  PlayCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Exams() {
  const navigate = useNavigate();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['studentExams'],
    queryFn: studentExamApi.getMyExams,
  });

  const getStatusBadge = (exam: any) => {
    if (exam.isExpired) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded flex items-center gap-1">
          <AlertCircle size={12} />
          Expiré
        </span>
      );
    }
    if (exam.isUpcoming) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center gap-1">
          <Clock size={12} />
          À venir
        </span>
      );
    }
    if (exam.hasCurrentAttempt) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded flex items-center gap-1">
          <PlayCircle size={12} />
          En cours
        </span>
      );
    }
    if (exam.completedAttempts >= exam.maxAttempts) {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded flex items-center gap-1">
          <CheckCircle size={12} />
          Terminé
        </span>
      );
    }
    if (exam.isAvailable) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
          <CheckCircle size={12} />
          Disponible
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des examens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Examens</h1>
        <p className="text-gray-600 mt-1">
          Examens disponibles et tentatives
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Examens</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.filter((e: any) => e.isAvailable && e.canAttempt).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.filter((e: any) => e.hasCurrentAttempt).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <PlayCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complétés</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.filter((e: any) => e.completedAttempts > 0).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Examens */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {exams.map((exam: any) => (
            <div key={exam.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {exam.title}
                      </h3>
                      {getStatusBadge(exam)}
                    </div>
                    {exam.description && (
                      <p className="text-gray-600 text-sm mb-2">{exam.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {exam.course?.code} - {exam.course?.title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{exam.questionCount} question(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award size={16} />
                    <span>{exam.totalPoints} points</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PlayCircle size={16} />
                    <span>{exam.attemptCount}/{exam.maxAttempts} tentative(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(exam.startTime).toLocaleString('fr-CA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                        {' - '}
                        {new Date(exam.endTime).toLocaleString('fr-CA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {exam.hasCurrentAttempt && (
                      <button
                        onClick={() => navigate(`/student/exams/${exam.id}/attempt/${exam.currentAttemptId}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlayCircle size={16} />
                        Continuer
                      </button>
                    )}

                    {exam.canAttempt && !exam.hasCurrentAttempt && (
                      <button
                        onClick={() => navigate(`/student/exams/${exam.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <PlayCircle size={16} />
                        Commencer
                      </button>
                    )}

                    {exam.completedAttempts > 0 && (
                      <button
                        onClick={() => navigate(`/student/exams/${exam.id}/results`)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Eye size={16} />
                        Voir les Résultats
                      </button>
                    )}

                    {!exam.canAttempt && !exam.hasCurrentAttempt && exam.completedAttempts === 0 && (
                      <button
                        disabled
                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                      >
                        Non disponible
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun examen disponible
          </h3>
          <p className="text-gray-600">
            Aucun examen n'est actuellement disponible pour vos cours
          </p>
        </div>
      )}
    </div>
  );
}
