/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

/**
 * Get attempt details for grading
 */
const teacherExamsExamIdAttemptsAttemptIdGradingGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const exam = db.getExamById(params.examId);
      if (!exam) {
        return reject(Service.rejectResponse('Exam not found', 404));
      }

      // Vérifier que c'est bien l'examen du teacher
      if (exam.teacherId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      // Vérifier que la tentative est pour cet examen
      if (attempt.examId !== params.examId) {
        return reject(Service.rejectResponse('Attempt does not belong to this exam', 400));
      }

      // Récupérer les infos de l'étudiant
      const student = db.getUserById(attempt.studentId);
      
      // Récupérer les questions et réponses
      const questions = db.getQuestionsByExam(params.examId);
      const answers = db.getAnswersByAttempt(params.attemptId);

      // ✅ FIX: Créer une fonction helper pour évaluer les réponses
      const evaluateAnswer = (question, answer) => {
        if (!answer) return { studentAnswer: null, isCorrect: null, pointsAwarded: null };

        if (question.type === 'MCQ') {
          // ✅ NOUVEAU: Gérer BOTH mono et multi-choix
          const isSingleChoice = !question.allowMultiple;
          
          if (isSingleChoice) {
            // Mono-choix: comparer une seule réponse
            const studentAnswer = answer.selectedOption;
            const correctOption = question.options.find(opt => opt.isCorrect);
            const isCorrect = correctOption && answer.selectedOption === correctOption.id;
            
            return {
              studentAnswer,
              isCorrect,
              pointsAwarded: isCorrect ? question.points : 0,
            };
          } else {
            // ✅ Multi-choix: comparer un array
            const studentAnswers = Array.isArray(answer.selectedOptions) 
              ? answer.selectedOptions 
              : [answer.selectedOptions];
            
            const correctOptions = question.options
              .filter(opt => opt.isCorrect)
              .map(opt => opt.id);

            // ✅ Vérifier que TOUS les bonnes réponses sont sélectionnées
            // ET que PAS de réponses incorrectes
            const isCorrect = 
              studentAnswers.length === correctOptions.length &&
              studentAnswers.every(ans => correctOptions.includes(ans));

            return {
              studentAnswer: studentAnswers,
              isCorrect,
              pointsAwarded: isCorrect ? question.points : 0,
            };
          }
        } 
        else if (question.type === 'TRUE_FALSE') {
          // ✅ FIX: Normaliser boolean vs string
          const studentAnswer = String(answer.booleanAnswer).toLowerCase();
          const correctAnswer = String(question.correctAnswer).toLowerCase();
          const isCorrect = studentAnswer === correctAnswer;

          return {
            studentAnswer,
            isCorrect,
            pointsAwarded: isCorrect ? question.points : 0,
          };
        } 
        else if (question.type === 'OPEN_ENDED') {
          // Pour les questions ouvertes, on récupère les points attribués manuellement
          return {
            studentAnswer: answer.textAnswer,
            isCorrect: null,  // À déterminer manuellement
            pointsAwarded: answer.pointsAwarded !== undefined ? answer.pointsAwarded : null,
          };
        }

        return { studentAnswer: null, isCorrect: null, pointsAwarded: null };
      };

      // Enrichir les questions avec les réponses de l'étudiant
      const questionsWithAnswers = questions.map(question => {
        const answer = answers.find(a => a.questionId === question.id);
        const { studentAnswer, isCorrect, pointsAwarded } = evaluateAnswer(question, answer);

        return {
          ...question,
          studentAnswer,
          isCorrect,
          pointsAwarded,
          feedback: answer?.feedback || null,
        };
      });

      // ✅ FIX: Calculer le score correctement
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const currentScore = questionsWithAnswers.reduce((sum, q) => {
        return sum + (q.pointsAwarded !== null ? q.pointsAwarded : 0);
      }, 0);

      // Vérifier si toutes les questions ouvertes sont corrigées
      const openEndedQuestions = questionsWithAnswers.filter(q => q.type === 'OPEN_ENDED');
      const allGraded = openEndedQuestions.every(q => q.pointsAwarded !== null);

      const enrichedAttempt = {
        ...attempt,
        student: student ? {
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
        } : null,
        exam: {
          id: exam.id,
          title: exam.title,
          totalPoints,
        },
        questions: questionsWithAnswers,
        currentScore,
        totalPoints,
        allGraded,
      };

      resolve(Service.successResponse(enrichedAttempt));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdAttemptsAttemptIdGradingGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch attempt for grading',
        e.status || 500
      ));
    }
  },
);

/**
 * Grade a question (assign points and feedback)
 */
const teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const exam = db.getExamById(params.examId);
      if (!exam) {
        return reject(Service.rejectResponse('Exam not found', 404));
      }

      // Vérifier que c'est bien l'examen du teacher
      if (exam.teacherId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      const question = db.getQuestionById(params.questionId);
      if (!question || question.examId !== params.examId) {
        return reject(Service.rejectResponse('Question not found', 404));
      }

      const gradingData = params.body || params;
      const { pointsAwarded, feedback } = gradingData;

      // Validation
      if (pointsAwarded === undefined || pointsAwarded === null) {
        return reject(Service.rejectResponse('Points awarded is required', 400));
      }

      if (pointsAwarded < 0 || pointsAwarded > question.points) {
        return reject(Service.rejectResponse(
          `Points must be between 0 and ${question.points}`,
          400
        ));
      }

      // Trouver la réponse
      const answer = db.getAnswerByAttemptQuestion(params.attemptId, params.questionId);
      if (!answer) {
        return reject(Service.rejectResponse('Answer not found', 404));
      }

      // Mettre à jour la réponse avec les points et le feedback
      const updatedAnswer = db.updateAnswer(answer.id, {
        pointsAwarded,
        feedback: feedback || null,
      });

      // ✅ FIX: Recalculer le score total avec la fonction helper
      const allAnswers = db.getAnswersByAttempt(params.attemptId);
      const questions = db.getQuestionsByExam(params.examId);
      
      let totalScore = 0;
      questions.forEach(q => {
        const ans = allAnswers.find(a => a.questionId === q.id);
        
        if (q.type === 'MCQ') {
          // ✅ Gérer mono et multi-choix
          const isSingleChoice = !q.allowMultiple;
          
          if (isSingleChoice) {
            const correctOption = q.options.find(opt => opt.isCorrect);
            if (correctOption && ans && ans.selectedOption === correctOption.id) {
              totalScore += q.points;
            }
          } else {
            // ✅ Multi-choix
            if (ans) {
              const studentAnswers = Array.isArray(ans.selectedOptions) 
                ? ans.selectedOptions 
                : [ans.selectedOptions];
              
              const correctOptions = q.options
                .filter(opt => opt.isCorrect)
                .map(opt => opt.id);

              const isCorrect = 
                studentAnswers.length === correctOptions.length &&
                studentAnswers.every(a => correctOptions.includes(a));

              if (isCorrect) {
                totalScore += q.points;
              }
            }
          }
        } 
        else if (q.type === 'TRUE_FALSE') {
          // ✅ Normaliser boolean vs string
          if (ans) {
            const studentAnswer = String(ans.booleanAnswer).toLowerCase();
            const correctAnswer = String(q.correctAnswer).toLowerCase();
            if (studentAnswer === correctAnswer) {
              totalScore += q.points;
            }
          }
        } 
        else if (q.type === 'OPEN_ENDED') {
          if (ans && ans.pointsAwarded !== undefined && ans.pointsAwarded !== null) {
            totalScore += ans.pointsAwarded;
          }
        }
      });

      // Mettre à jour le score de la tentative
      db.updateAttempt(params.attemptId, { score: totalScore });

      console.log('✅ Question graded:', params.questionId, 'Points:', pointsAwarded, 'New total:', totalScore);
      resolve(Service.successResponse({
        ...updatedAnswer,
        totalScore,
      }));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to grade question',
        e.status || 500
      ));
    }
  },
);

/**
 * Finalize grading (mark attempt as fully graded)
 */
const teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const exam = db.getExamById(params.examId);
      if (!exam) {
        return reject(Service.rejectResponse('Exam not found', 404));
      }

      // Vérifier que c'est bien l'examen du teacher
      if (exam.teacherId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      // Vérifier que toutes les questions ouvertes sont corrigées
      const questions = db.getQuestionsByExam(params.examId);
      const answers = db.getAnswersByAttempt(params.attemptId);
      
      const openEndedQuestions = questions.filter(q => q.type === 'OPEN_ENDED');
      const allGraded = openEndedQuestions.every(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return answer && answer.pointsAwarded !== undefined && answer.pointsAwarded !== null;
      });

      if (!allGraded) {
        return reject(Service.rejectResponse(
          'All open-ended questions must be graded before finalizing',
          400
        ));
      }

      // Marquer la tentative comme "GRADED"
      const updatedAttempt = db.updateAttempt(params.attemptId, {
        status: 'GRADED',
        gradedAt: new Date().toISOString(),
      });

      console.log('✅ Grading finalized for attempt:', params.attemptId);
      resolve(Service.successResponse(updatedAttempt));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to finalize grading',
        e.status || 500
      ));
    }
  },
);

module.exports = {
  teacherExamsExamIdAttemptsAttemptIdGradingGET,
  teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT,
  teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST,
};
