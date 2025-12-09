import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { teacherExamApi } from '../../api/teacherExam';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { QuestionForm } from '../../components/teacher/QuestionForm';

export function ExamDetails() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['teacherExam', examId],
    queryFn: () => teacherExamApi.getExamById(examId!),
    enabled: !!examId,
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: ({ questionId }: { questionId: string }) => 
      teacherExamApi.deleteQuestion(examId!, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExam', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Question supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const publishMutation = useMutation({
    mutationFn: teacherExamApi.publishExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExam', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Examen publié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la publication');
    },
  });

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      deleteQuestionMutation.mutate({ questionId });
    }
  };

  const handlePublish = () => {
    if (confirm('Êtes-vous sûr de vouloir publier cet examen ? Il sera visible par les étudiants.')) {
      publishMutation.mutate(examId!);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'MCQ':
        return 'Choix multiple';
      case 'TRUE_FALSE':
        return 'Vrai/Faux';
      case 'OPEN_ENDED':
        return 'Question ouverte';
      default:
        return type;
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            {exam.status === 'DRAFT' && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded flex items-center gap-1">
                <Edit size={12} />
                Brouillon
              </span>
            )}
            {exam.status === 'PUBLISHED' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
                <CheckCircle size={12} />
                Publié
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            {exam.course?.code} - {exam.course?.title} ({exam.session?.semester})
          </p>
        </div>
        {exam.status === 'DRAFT' && exam.questions?.length > 0 && (
          <button
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
          >
            <Send size={20} />
            Publier l'Examen
          </button>
        )}
      </div>
        {exam.status === 'PUBLISHED' && exam.attemptCount > 0 && (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Corrections</h2>
      <button
        onClick={() => navigate(`/teacher/exams/${examId}/grading`)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Edit size={20} />
        Corriger les Tentatives
      </button>
    </div>
    <p className="text-gray-600 text-sm">
      {exam.attemptCount} tentative(s) à corriger
    </p>
  </div>
)}
      {/* Informations de l'examen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
        {exam.description && (
          <p className="text-gray-600 mb-4">{exam.description}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="text-gray-400" size={16} />
            <div>
              <p className="text-gray-600">Durée</p>
              <p className="font-semibold">{exam.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="text-gray-400" size={16} />
            <div>
              <p className="text-gray-600">Questions</p>
              <p className="font-semibold">{exam.questions?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="text-gray-400" size={16} />
            <div>
              <p className="text-gray-600">Points totaux</p>
              <p className="font-semibold">{exam.totalPoints || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="text-gray-400" size={16} />
            <div>
              <p className="text-gray-600">Tentatives max</p>
              <p className="font-semibold">{exam.maxAttempts}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Début</p>
              <p className="font-semibold">
                {new Date(exam.startTime).toLocaleString('fr-CA', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Fin</p>
              <p className="font-semibold">
                {new Date(exam.endTime).toLocaleString('fr-CA', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Corrections */}
{exam.status === 'PUBLISHED' && exam.attemptCount > 0 && (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Corrections</h2>
        <p className="text-sm text-gray-600 mt-1">
          Corriger les tentatives des étudiants
        </p>
      </div>
      <button
        onClick={() => navigate(`/teacher/exams/${examId}/grading`)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Edit size={20} />
        Voir les Tentatives
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-xl font-bold text-gray-900">{exam.attemptCount}</p>
      </div>
      <div className="p-3 bg-orange-50 rounded-lg">
        <p className="text-sm text-orange-600">À corriger</p>
        <p className="text-xl font-bold text-orange-600">
          {/* On affichera le nombre exact plus tard */}
          -
        </p>
      </div>
      <div className="p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-600">Corrigées</p>
        <p className="text-xl font-bold text-green-600">
          {/* On affichera le nombre exact plus tard */}
          -
        </p>
      </div>
    </div>
  </div>
)}
      {/* Questions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
          {exam.status === 'DRAFT' && (
            <button
              onClick={() => setIsAddingQuestion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Ajouter une Question
            </button>
          )}
        </div>

        {exam.questions?.length > 0 ? (
          <div className="space-y-4">
            {exam.questions.map((question: any, index: number) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {question.points} point{question.points > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{question.text}</p>
                  </div>
                  {exam.status === 'DRAFT' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Options pour MCQ */}
                {question.type === 'MCQ' && question.options && (
                  <div className="mt-3 space-y-2">
                    {question.options.map((option: any, optIndex: number) => (
                      <div
                        key={option.id || optIndex}
                        className={`p-3 rounded-lg border ${
                          option.isCorrect
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {option.isCorrect && (
                            <CheckCircle className="text-green-600" size={16} />
                          )}
                          <span className={option.isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                            {option.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Réponse pour TRUE_FALSE */}
                {question.type === 'TRUE_FALSE' && (
                  <div className="mt-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                      question.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <CheckCircle size={16} className={question.correctAnswer ? 'text-green-600' : 'text-red-600'} />
                      <span className={`font-medium ${question.correctAnswer ? 'text-green-900' : 'text-red-900'}`}>
                        Réponse correcte : {question.correctAnswer ? 'Vrai' : 'Faux'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info pour OPEN_ENDED */}
                {question.type === 'OPEN_ENDED' && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Cette question nécessite une correction manuelle
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune question ajoutée
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter des questions à votre examen
            </p>
            {exam.status === 'DRAFT' && (
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Ajouter une Question
              </button>
            )}
          </div>
        )}

        {exam.status === 'DRAFT' && exam.questions?.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle size={16} />
              Vous devez ajouter au moins une question avant de publier l'examen
            </p>
          </div>
        )}
      </div>

      {/* Modal d'ajout de question */}
      {isAddingQuestion && (
        <QuestionForm
          examId={examId!}
          onClose={() => setIsAddingQuestion(false)}
          onSuccess={() => {
            setIsAddingQuestion(false);
            queryClient.invalidateQueries({ queryKey: ['teacherExam', examId] });
            queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
          }}
        />
      )}

      {/* Modal d'édition de question */}
      {editingQuestion && (
        <QuestionForm
          examId={examId!}
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => {
            setEditingQuestion(null);
            queryClient.invalidateQueries({ queryKey: ['teacherExam', examId] });
            queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
          }}
        />
      )}
    </div>
  );
}
