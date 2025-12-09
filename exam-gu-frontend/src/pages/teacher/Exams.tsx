import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherExamApi } from '../../api/teacherExam';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Exams() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ CORRECTION: Gérer le cas où la réponse est un objet
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: teacherExamApi.getMyExams,
  });

  const exams = Array.isArray(examsData) ? examsData : (examsData?.data || []);

  const deleteMutation = useMutation({
    mutationFn: teacherExamApi.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Examen supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const publishMutation = useMutation({
    mutationFn: teacherExamApi.publishExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Examen publié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la publication');
    },
  });

  const handleDelete = (examId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      deleteMutation.mutate(examId);
    }
  };

  const handlePublish = (examId: string) => {
    if (confirm('Êtes-vous sûr de vouloir publier cet examen ? Il sera visible par les étudiants.')) {
      publishMutation.mutate(examId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded flex items-center gap-1">
            <Edit size={12} />
            Brouillon
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
            <CheckCircle size={12} />
            Publié
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center gap-1">
            <AlertCircle size={12} />
            Archivé
          </span>
        );
      default:
        return null;
    }
  };

  const isExamActive = (exam: any) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);
    return now >= start && now <= end;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Examens</h1>
          <p className="text-gray-600 mt-1">
            Créer et gérer vos examens
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/exams/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Créer un Examen
        </button>
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
              <p className="text-sm font-medium text-gray-600">Brouillons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.filter((e: any) => e.status === 'DRAFT').length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Edit className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publiés</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.filter((e: any) => e.status === 'PUBLISHED').length}
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
              <p className="text-sm font-medium text-gray-600">Tentatives</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {exams.reduce((sum: number, e: any) => sum + (e.attemptCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
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
                      {getStatusBadge(exam.status)}
                      {exam.status === 'PUBLISHED' && isExamActive(exam) && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded flex items-center gap-1">
                          <Clock size={12} />
                          En cours
                        </span>
                      )}
                    </div>
                    {exam.description && (
                      <p className="text-gray-600 text-sm">{exam.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye size={20} />
                    </button>
                    {exam.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{exam.course?.code} - {exam.course?.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{exam.session?.semester}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{exam.attemptCount || 0} tentative(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      <strong>{exam.questionCount || 0}</strong> question(s)
                    </span>
                    <span className="text-gray-600">
                      <strong>{exam.totalPoints || 0}</strong> points
                    </span>
                    <span className="text-gray-600">
                      <strong>{exam.maxAttempts}</strong> tentative(s) max
                    </span>
                  </div>

                  {exam.status === 'DRAFT' && exam.questionCount > 0 && (
                    <button
                      onClick={() => handlePublish(exam.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send size={16} />
                      Publier
                    </button>
                  )}

                  {exam.status === 'PUBLISHED' && (
                    <button
                      onClick={() => navigate(`/teacher/exams/${exam.id}/grading`)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Users size={16} />
                      Voir les Tentatives
                    </button>
                  )}
                </div>

                {exam.status === 'DRAFT' && exam.questionCount === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Ajoutez au moins une question avant de publier cet examen
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun examen créé
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre premier examen
          </p>
          <button
            onClick={() => navigate('/teacher/exams/create')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Créer un Examen
          </button>
        </div>
      )}
    </div>
  );
}
