import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { studentExamApi } from '../../api/studentExam';
import type { SaveAnswerRequest } from '../../api/studentExam';
import { 
  Clock, 
  AlertCircle,
  Send,
  ArrowLeft
} from 'lucide-react';

export function TakeExam() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Récupérer la tentative
  const { data: attempt, isLoading } = useQuery({
    queryKey: ['studentAttempt', examId, attemptId],
    queryFn: () => studentExamApi.getAttempt(examId!, attemptId!),
    enabled: !!examId && !!attemptId,
    refetchInterval: 30000,
  });

  // Soumettre l'examen
  const submitExamMutation = useMutation({
    mutationFn: () => studentExamApi.submitExam(examId!, attemptId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentExams'] });
      queryClient.invalidateQueries({ queryKey: ['studentExam', examId] });
      queryClient.invalidateQueries({ queryKey: ['studentAttempt', examId, attemptId] });

      toast.success('Examen soumis avec succès !');
      
      navigate(`/student/exams/${examId}/results`, { 
        state: { score: data.totalScore, maxScore: data.maxScore },
        replace: true
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission');
      setIsAutoSubmitting(false);
    },
  });

  // Sauvegarder une réponse
  const saveAnswerMutation = useMutation({
    mutationFn: (data: SaveAnswerRequest) => 
      studentExamApi.saveAnswer(examId!, attemptId!, data),
    onError: (error: any) => {
      console.error('Erreur sauvegarde:', error.response?.data?.message);
    },
  });

  // Soumission auto
  const handleAutoSubmit = useCallback(() => {
    if (isAutoSubmitting) return;
    
    setIsAutoSubmitting(true);
    toast.info('Le temps est écoulé. Soumission automatique...', { duration: 2000 });
    
    setTimeout(() => {
      submitExamMutation.mutate();
    }, 1000);
  }, [isAutoSubmitting, submitExamMutation]);

  // Init timer
  useEffect(() => {
    if (attempt && !hasInitializedRef.current) {
      hasInitializedRef.current = true;

      const existingAnswers: Record<string, any> = {};
      attempt.questions?.forEach((q: any) => {
        if (q.studentAnswer !== undefined && q.studentAnswer !== null) {
          existingAnswers[q.id] = q.studentAnswer;
        }
      });
      setAnswers(existingAnswers);

      const startTime = new Date(attempt.startTime).getTime();
      const duration = attempt.exam.duration * 60 * 1000;
      const endTime = startTime + duration;
      endTimeRef.current = endTime;

      const now = Date.now();
      const remaining = endTime - now;

      if (remaining > 0) {
        setTimeRemaining(Math.floor(remaining / 1000));
      } else {
        setTimeRemaining(0);
        handleAutoSubmit();
      }
    }
  }, [attempt, handleAutoSubmit]);

  // Timer
  useEffect(() => {
    if (!endTimeRef.current || isAutoSubmitting) return;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTimeRef.current! - now;
      const secondsRemaining = Math.ceil(remaining / 1000);

      if (secondsRemaining <= 0) {
        clearInterval(timerIntervalRef.current!);
        setTimeRemaining(0);
        handleAutoSubmit();
        return;
      }

      setTimeRemaining(secondsRemaining);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isAutoSubmitting, handleAutoSubmit]);

  // ✅ UNE SEULE FONCTION POUR TOUT!
  const handleAnswerChange = useCallback((questionId: string, newAnswer: any) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: newAnswer };
      console.log('📝 Answer changed for Q:', questionId, 'New value:', newAnswer);
      return updated;
    });
  }, []);

  // ✅ UNE SEULE FONCTION POUR SAUVEGARDER!
  const handleSaveAnswer = useCallback((questionId: string, questionType: string) => {
    const answer = answers[questionId];
    
    // Ignorer si pas de réponse
    if (answer === undefined || answer === null || answer === '' || 
        (Array.isArray(answer) && answer.length === 0)) {
      return;
    }

    console.log('💾 Saving answer - Q:', questionId, 'Type:', questionType, 'Answer:', answer);

    const data: SaveAnswerRequest = {
      questionId,
    };

    // ✅ Détecter automatiquement mono vs multi-choix
    if (questionType === 'MCQ') {
      if (Array.isArray(answer)) {
        data.selectedOptions = answer;  // Multi-choix
      } else {
        data.selectedOption = answer;   // Mono-choix
      }
    } else if (questionType === 'TRUE_FALSE') {
      data.booleanAnswer = answer;
    } else if (questionType === 'OPEN_ENDED') {
      data.textAnswer = answer;
    }

    saveAnswerMutation.mutate(data);
  }, [answers, saveAnswerMutation]);

  // ✅ NOUVELLE FONCTION: Sauvegarder avec la valeur passée en paramètre
const saveAnswerDirect = useCallback((questionId: string, questionType: string, answerValue: any) => {
  if (answerValue === undefined || answerValue === null || answerValue === '' || 
      (Array.isArray(answerValue) && answerValue.length === 0)) {
    return;
  }

  console.log('💾 Saving answer DIRECTLY - Q:', questionId, 'Type:', questionType, 'Answer:', answerValue);

  const data: SaveAnswerRequest = {
    questionId,
  };

  if (questionType === 'MCQ') {
    if (Array.isArray(answerValue)) {
      data.selectedOptions = answerValue;
    } else {
      data.selectedOption = answerValue;
    }
  } else if (questionType === 'TRUE_FALSE') {
    data.booleanAnswer = answerValue;
  } else if (questionType === 'OPEN_ENDED') {
    data.textAnswer = answerValue;
  }

  saveAnswerMutation.mutate(data);
}, [saveAnswerMutation]);


  const handleSubmit = () => {
    const unanswered = attempt?.questions?.filter((q: any) => 
      answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '' ||
      (Array.isArray(answers[q.id]) && answers[q.id].length === 0)
    ).length || 0;

    const message = unanswered > 0
      ? `Vous avez ${unanswered} question(s) non répondue(s). Êtes-vous sûr ?`
      : 'Êtes-vous sûr de vouloir soumettre l\'examen ?';

    if (confirm(message)) {
      submitExamMutation.mutate();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return 'text-red-600';
    if (timeRemaining < 600) return 'text-orange-600';
    return 'text-green-600';
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

  if (!attempt) {
    return <div className="text-center py-12"><p className="text-gray-600">Tentative non trouvée</p></div>;
  }

  const currentQuestion = attempt.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / attempt.questions?.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => {
    const answer = answers[key];
    return answer !== undefined && answer !== null && answer !== '' &&
           !(Array.isArray(answer) && answer.length === 0);
  }).length;

const isMultiChoice = currentQuestion?.type === 'MCQ' && 
  currentQuestion?.allowMultiple === true;



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{attempt.exam.title}</h1>
            <p className="text-sm text-gray-600">
              {attempt.exam.course?.code} - {attempt.exam.course?.title}
            </p>
          </div>
          <div className={`flex items-center gap-2 text-2xl font-bold ${getTimeColor()}`}>
            <Clock size={24} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} sur {attempt.questions?.length}</span>
            <span>{answeredCount}/{attempt.questions?.length} répondue(s)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded">
                {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}
              </span>
              {currentQuestion.type === 'MCQ' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded">
                  {isMultiChoice ? '☑️ Choix multiples' : '🔘 Choix unique'}
                </span>
              )}
              {currentQuestion.type === 'TRUE_FALSE' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                  Vrai/Faux
                </span>
              )}
              {currentQuestion.type === 'OPEN_ENDED' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded">
                  Question ouverte
                </span>
              )}
            </div>
            <p className="text-lg text-gray-900">{currentQuestion.text}</p>
          </div>

         {/* QCM - MONO OU MULTI */}
{currentQuestion.type === 'MCQ' && (
  <div className="space-y-3">
    {currentQuestion.options?.map((option: any, index: number) => {
      const isSelected = Array.isArray(answers[currentQuestion.id])
        ? answers[currentQuestion.id].includes(option.id)
        : answers[currentQuestion.id] === option.id;

      return (
        <label
          key={`${currentQuestion.id}-${option.id}-${index}`}
          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <input
            type={isMultiChoice ? 'checkbox' : 'radio'}
            name={isMultiChoice ? undefined : `question-${currentQuestion.id}`}
            value={option.id}
            checked={isSelected}
            onChange={(e) => {
              if (isMultiChoice) {
                // ✅ MULTI-CHOIX
                const currentAnswers = answers[currentQuestion.id] || [];
                const updatedAnswers = e.target.checked
                  ? [...currentAnswers, option.id]
                  : currentAnswers.filter((id: string) => id !== option.id);
                
                handleAnswerChange(currentQuestion.id, updatedAnswers);
                
                // ✅ PASSER LA NOUVELLE VALEUR DIRECTEMENT!
                setTimeout(() => {
                  saveAnswerDirect(currentQuestion.id, 'MCQ', updatedAnswers);
                }, 100);
              } else {
                // ✅ MONO-CHOIX
                const newAnswer = option.id;  // ✅ LA NOUVELLE VALEUR!
                handleAnswerChange(currentQuestion.id, newAnswer);
                
                // ✅ PASSER LA NOUVELLE VALEUR DIRECTEMENT!
                setTimeout(() => {
                  saveAnswerDirect(currentQuestion.id, 'MCQ', newAnswer);
                }, 100);
              }
            }}
            className="w-5 h-5 text-blue-600"
          />
          <span className="ml-3 text-gray-900">{option.text}</span>
        </label>
      );
    })}
  </div>
)}




          {/* VRAI/FAUX */}
{currentQuestion.type === 'TRUE_FALSE' && (
  <div className="space-y-3">
    <label
      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
        answers[currentQuestion.id] === true
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-green-300'
      }`}
    >
      <input
        type="radio"
        name={`question-${currentQuestion.id}`}
        checked={answers[currentQuestion.id] === true}
        onChange={() => {
          const newAnswer = true; // ✅ NOUVELLE VALEUR
          handleAnswerChange(currentQuestion.id, newAnswer);
          // ✅ PASSER LA NOUVELLE VALEUR DIRECTEMENT!
          setTimeout(() => {
            saveAnswerDirect(currentQuestion.id, 'TRUE_FALSE', newAnswer);
          }, 100);
        }}
        className="w-5 h-5 text-green-600"
      />
      <span className="ml-3 text-gray-900 font-medium">Vrai</span>
    </label>
    <label
      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
        answers[currentQuestion.id] === false
          ? 'border-red-500 bg-red-50'
          : 'border-gray-200 hover:border-red-300'
      }`}
    >
      <input
        type="radio"
        name={`question-${currentQuestion.id}`}
        checked={answers[currentQuestion.id] === false}
        onChange={() => {
          const newAnswer = false; // ✅ NOUVELLE VALEUR
          handleAnswerChange(currentQuestion.id, newAnswer);
          // ✅ PASSER LA NOUVELLE VALEUR DIRECTEMENT!
          setTimeout(() => {
            saveAnswerDirect(currentQuestion.id, 'TRUE_FALSE', newAnswer);
          }, 100);
        }}
        className="w-5 h-5 text-red-600"
      />
      <span className="ml-3 text-gray-900 font-medium">Faux</span>
    </label>
  </div>
)}


          {/* QUESTION OUVERTE */}
          {currentQuestion.type === 'OPEN_ENDED' && (
            <div>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                onBlur={() => handleSaveAnswer(currentQuestion.id, 'OPEN_ENDED')}
                rows={8}
                placeholder="Tapez votre réponse ici..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                💾 Votre réponse est sauvegardée automatiquement
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            Précédent
          </button>

          <div className="flex gap-2 overflow-x-auto max-w-md">
            {attempt.questions?.map((_: any, index: number) => {
              const answer = answers[attempt.questions[index].id];
              const isAnswered = answer !== undefined && answer !== null && answer !== '' &&
                                 !(Array.isArray(answer) && answer.length === 0);

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {currentQuestionIndex < attempt.questions?.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => 
                Math.min(attempt.questions.length - 1, prev + 1)
              )}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Suivant
              <ArrowLeft size={16} className="rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitExamMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              <Send size={16} />
              {submitExamMutation.isPending ? 'Soumission...' : 'Soumettre l\'Examen'}
            </button>
          )}
        </div>
      </div>

      {/* Avertissement temps */}
      {timeRemaining < 300 && timeRemaining > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <p className="font-semibold">Attention ! Il vous reste moins de 5 minutes !</p>
          </div>
        </div>
      )}

      {/* Soumission auto */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 mb-2">Temps écoulé !</p>
            <p className="text-gray-600">Votre examen est en cours de soumission automatique...</p>
          </div>
        </div>
      )}
    </div>
  );
}
