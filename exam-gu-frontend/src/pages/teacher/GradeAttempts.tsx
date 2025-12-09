import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teacherExamApi } from '../../api/teacherExam';
import { 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  User,
  Eye
} from 'lucide-react';

export function GradeAttempts() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['teacherExamAttempts', examId],
    queryFn: () => teacherExamApi.getExamAttempts(examId!),
    enabled: !!examId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des tentatives...</p>
        </div>
      </div>
    );
  }

  const submittedAttempts = attempts.filter((a: any) => 
    a.status === 'SUBMITTED' || a.status === 'GRADED'
  );

  const needsGrading = submittedAttempts.filter((a: any) => a.status === 'SUBMITTED');
  const graded = submittedAttempts.filter((a: any) => a.status === 'GRADED');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/teacher/exams/${examId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Correction des Tentatives</h1>
          <p className="text-gray-600 mt-1">
            Corriger les réponses des étudiants
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tentatives</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {submittedAttempts.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">À Corriger</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {needsGrading.length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corrigées</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {graded.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tentatives */}
      {submittedAttempts.length > 0 ? (
        <div className="space-y-4">
          {/* Tentatives à corriger */}
          {needsGrading.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-orange-600" size={20} />
                  À Corriger ({needsGrading.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {needsGrading.map((attempt: any) => (
                  <div key={attempt.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="text-orange-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {attempt.student?.firstName} {attempt.student?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attempt.student?.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Soumis le {new Date(attempt.endTime || attempt.startTime).toLocaleString('fr-CA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Réponses</p>
                          <p className="text-lg font-bold text-gray-900">
                            {attempt.answerCount}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/teacher/exams/${examId}/attempts/${attempt.id}/grade`)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <Edit size={16} />
                          Corriger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tentatives corrigées */}
          {graded.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  Corrigées ({graded.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {graded.map((attempt: any) => (
                  <div key={attempt.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="text-green-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {attempt.student?.firstName} {attempt.student?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attempt.student?.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Corrigé le {new Date(attempt.gradedAt || attempt.endTime).toLocaleString('fr-CA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="text-lg font-bold text-green-600">
                            {attempt.score} points
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/teacher/exams/${examId}/attempts/${attempt.id}/grade`)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={16} />
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune tentative à corriger
          </h3>
          <p className="text-gray-600">
            Les étudiants n'ont pas encore soumis de tentatives pour cet examen
          </p>
        </div>
      )}
    </div>
  );
}
