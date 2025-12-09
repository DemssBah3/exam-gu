import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherExamApi } from '../../api/teacherExam';
import type { CreateExamRequest } from '../../api/teacherExam';
import { teacherApi } from '../../api/teacher';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';

interface Question {
  type: 'MCQ' | 'TRUE_FALSE' | 'OPEN_ENDED';
  text: string;
  points: number;
  allowMultiple?: boolean;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: boolean | string;
}

export function CreateExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const preSelectedSessionId = location.state?.sessionId;

  const [formData, setFormData] = useState<CreateExamRequest>({
    sessionId: preSelectedSessionId || '',
    title: '',
    description: '',
    duration: 60,
    startTime: '',
    endTime: '',
    maxAttempts: 1,
  });

  // ✅ État pour les questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<Question>({
    type: 'MCQ',
    text: '',
    points: 5,
    allowMultiple: false,
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ['teacherMySessions'],
    queryFn: teacherApi.getMySessions,
  });

  const createMutation = useMutation({
    mutationFn: teacherExamApi.createExam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacherExams'] });
      toast.success('Examen créé avec succès');
      navigate(`/teacher/exams/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Error creating exam:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la création';
      toast.error(errorMessage);
    },
  });

  // ✅ Ajouter une question
  const addQuestion = () => {
    if (!newQuestion.text.trim()) {
      toast.error('Veuillez entrer le texte de la question');
      return;
    }

    if (newQuestion.type === 'MCQ') {
      const validOptions = (newQuestion.options || []).filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error('Au moins 2 options sont requises');
        return;
      }
      if (!validOptions.some(opt => opt.isCorrect)) {
        toast.error('Au moins une option doit être correcte');
        return;
      }
    }

    setQuestions([...questions, newQuestion]);
    
    // Réinitialiser le formulaire
    setNewQuestion({
      type: 'MCQ',
      text: '',
      points: 5,
      allowMultiple: false,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
    });
    setShowQuestionForm(false);
    toast.success('Question ajoutée');
  };

  // ✅ Supprimer une question
  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sessionId || !formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (questions.length === 0) {
      toast.error('Vous devez ajouter au moins une question');
      return;
    }

    // ✅ Ajouter les questions aux données à envoyer
    const dataToSend = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      questions: questions, // ✅ LES QUESTIONS!
    };

    console.log('Sending exam data:', dataToSend);
    createMutation.mutate(dataToSend);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'maxAttempts' ? parseInt(value) || 0 : value,
    }));
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un Examen</h1>
          <p className="text-gray-600 mt-1">
            Configurez les paramètres et ajoutez les questions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Paramètres Examen */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Paramètres de l'examen</h2>

          {/* Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session <span className="text-red-500">*</span>
            </label>
            <select
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez une session</option>
              {sessions.map((session: any) => (
                <option key={session.id} value={session.id}>
                  {session.course?.code} - {session.course?.title} ({session.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Examen Final - Hiver 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description de l'examen..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tentatives max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives maximales <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleChange}
                required
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Questions */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {questions.length} question(s) - {totalPoints} points
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Ajouter une question
            </button>
          </div>

          {/* Formulaire Ajouter Question */}
          {showQuestionForm && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de question
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => {
                    const type = e.target.value as 'MCQ' | 'TRUE_FALSE' | 'OPEN_ENDED';
                    setNewQuestion({
                      ...newQuestion,
                      type,
                      options: type === 'MCQ' ? [
                        { text: '', isCorrect: true },
                        { text: '', isCorrect: false },
                      ] : undefined,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MCQ">Choix Multiple (QCM)</option>
                  <option value="TRUE_FALSE">Vrai/Faux</option>
                  <option value="OPEN_ENDED">Question Ouverte</option>
                </select>
              </div>

              {/* Texte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte de la question
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  rows={2}
                  placeholder="Entrez le texte de la question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* MCQ Options */}
              {newQuestion.type === 'MCQ' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newQuestion.allowMultiple || false}
                        onChange={(e) => setNewQuestion({ ...newQuestion, allowMultiple: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Choix multiples?</span>
                    </label>
                  </div>
                  {(newQuestion.options || []).map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const updated = [...(newQuestion.options || [])];
                          updated[idx].text = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updated });
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <label className="flex items-center gap-2 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => {
                            const updated = [...(newQuestion.options || [])];
                            updated[idx].isCorrect = e.target.checked;
                            setNewQuestion({ ...newQuestion, options: updated });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">✓</span>
                      </label>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...(newQuestion.options || []), { text: '', isCorrect: false }];
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Ajouter une option
                  </button>
                </div>
              )}

              {/* TRUE_FALSE */}
              {newQuestion.type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réponse correcte
                  </label>
                  <select
                    value={newQuestion.correctAnswer === true ? 'true' : 'false'}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Vrai</option>
                    <option value="false">Faux</option>
                  </select>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter la question
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des Questions */}
          {questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Q{idx + 1}: {q.text}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Type: {q.type === 'MCQ' ? 'QCM' : q.type === 'TRUE_FALSE' ? 'Vrai/Faux' : 'Ouverte'} • 
                      Points: {q.points}
                      {q.type === 'MCQ' && q.allowMultiple && ' • Choix multiples'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons Finaux */}
        <div className="flex gap-4 bg-white rounded-lg shadow p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/teacher/exams')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || questions.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {createMutation.isPending ? 'Création...' : 'Créer l\'Examen'}
          </button>
        </div>
      </form>
    </div>
  );
}
