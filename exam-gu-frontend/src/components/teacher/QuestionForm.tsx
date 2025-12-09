import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherExamApi } from '../../api/teacherExam';
import type { CreateQuestionRequest } from '../../api/teacherExam';

import { X, Plus, Trash2, CheckCircle } from 'lucide-react';

interface QuestionFormProps {
  examId: string;
  question?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionForm({ examId, question, onClose, onSuccess }: QuestionFormProps) {
  const isEditing = !!question;

  // ✅ FIX: Initialiser correctement
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    type: question?.type || 'MCQ',
    text: question?.text || '',
    points: Number(question?.points) || 1,  // ✅ Forcer en number
    allowMultiple: question?.allowMultiple || false,  // ✅ Ajouter allowMultiple
    options: question?.options || [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: question?.correctAnswer ?? true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionRequest) => teacherExamApi.addQuestion(examId, data),
    onSuccess: () => {
      toast.success('Question ajoutée avec succès');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateQuestionRequest>) => 
      teacherExamApi.updateQuestion(examId, question.id, data),
    onSuccess: () => {
      toast.success('Question modifiée avec succès');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.text.trim()) {
      toast.error('Le texte de la question est obligatoire');
      return;
    }

    if (formData.type === 'MCQ') {
      const validOptions = formData.options?.filter(opt => opt.text.trim());
      if (!validOptions || validOptions.length < 2) {
        toast.error('Ajoutez au moins 2 options');
        return;
      }
      if (!validOptions.some(opt => opt.isCorrect)) {
        toast.error('Sélectionnez au moins une réponse correcte');
        return;
      }
      formData.options = validOptions;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', isCorrect: false }],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Modifier la Question' : 'Ajouter une Question'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de question <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isEditing}
            >
              <option value="MCQ">Choix multiple (QCM)</option>
              <option value="TRUE_FALSE">Vrai/Faux</option>
              <option value="OPEN_ENDED">Question ouverte</option>
            </select>
          </div>

          {/* Texte de la question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              rows={3}
              required
              placeholder="Entrez votre question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.points || 1}  // ✅ Défaut à 1
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;  // ✅ Défaut à 1 si NaN
                setFormData(prev => ({ ...prev, points: value }));
              }}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options pour MCQ */}
          {formData.type === 'MCQ' && (
            <div>
              {/* ✅ Allow Multiple Checkbox */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="allowMultiple"
                  checked={formData.allowMultiple || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowMultiple: e.target.checked }))}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="allowMultiple" className="text-sm text-gray-700">
                  ☑️ Autoriser les choix multiples?
                </label>
              </div>

              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options de réponse <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Ajouter une option
                </button>
              </div>
              <div className="space-y-3">
                {formData.options?.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleOptionChange(index, 'isCorrect', !option.isCorrect)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        option.isCorrect
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={option.isCorrect ? 'Réponse correcte' : 'Marquer comme correcte'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    {formData.options && formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Réponse pour TRUE_FALSE */}
          {formData.type === 'TRUE_FALSE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réponse correcte <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.correctAnswer === true}
                    onChange={() => setFormData(prev => ({ ...prev, correctAnswer: true }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Vrai</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.correctAnswer === false}
                    onChange={() => setFormData(prev => ({ ...prev, correctAnswer: false }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Faux</span>
                </label>
              </div>
            </div>
          )}

          {/* Info pour OPEN_ENDED */}
          {formData.type === 'OPEN_ENDED' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Les questions ouvertes nécessitent une correction manuelle. Les étudiants pourront saisir une réponse textuelle libre.
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {(createMutation.isPending || updateMutation.isPending) 
                ? 'Enregistrement...' 
                : isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
