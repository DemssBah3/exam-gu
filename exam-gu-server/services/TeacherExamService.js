/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

/**
 * Get all exams created by the teacher
 */
const teacherExamsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      // Récupérer les examens du teacher
      const exams = db.getExamsByTeacher(params.userId);

      // Enrichir avec les infos de session et cours
      const enrichedExams = exams.map(exam => {
        const session = db.getSessionById(exam.sessionId);
        const course = session ? db.getCourseById(session.courseId) : null;
        const questions = db.getQuestionsByExam(exam.id);
        const attempts = db.getAttemptsByExam(exam.id);

        return {
          ...exam,
          session,
          course,
          questionCount: questions.length,
          attemptCount: attempts.length,
          totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        };
      });

      console.log('✅ Found', enrichedExams.length, 'exams for teacher');
      resolve(Service.successResponse(enrichedExams));
    } catch (e) {
      console.error('❌ Error in teacherExamsGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch exams',
        e.status || 500
      ));
    }
  },
);

/**
 * Get a specific exam with all details
 */
const teacherExamsExamIdGET = (params) => new Promise(
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

      // Enrichir avec toutes les infos
      const session = db.getSessionById(exam.sessionId);
      const course = session ? db.getCourseById(session.courseId) : null;
      const questions = db.getQuestionsByExam(exam.id);
      const attempts = db.getAttemptsByExam(exam.id);

      const enrichedExam = {
        ...exam,
        session,
        course,
        questions,
        attemptCount: attempts.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
      };

      resolve(Service.successResponse(enrichedExam));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Create a new exam WITH questions
 */
const teacherExamsPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const examData = params.createExamRequest || params.body || params;
      const { sessionId, title, description, duration, startTime, endTime, maxAttempts, questions } = examData;

      // Validation
      if (!sessionId || !title || !duration || !startTime || !endTime) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      // Vérifier que le teacher est assigné à cette session
      if (!db.isTeacherAssigned(params.userId, sessionId)) {
        return reject(Service.rejectResponse('You are not assigned to this session', 403));
      }

      // Récupérer le courseId depuis la session
      const session = db.getSessionById(sessionId);
      if (!session) {
        return reject(Service.rejectResponse('Session not found', 404));
      }

      // Créer l'examen
      const newExam = db.createExam({
        sessionId,
        courseId: session.courseId,
        teacherId: params.userId,
        title,
        description,
        duration,
        startTime,
        endTime,
        maxAttempts: maxAttempts || 1,
        visibilityConfig: {
          showScore: true,
          showAnswers: false,
          showCorrectAnswers: false,
          showFeedback: true,
        },
      });

      console.log('✅ Exam created:', newExam.id);

      // ✅ NOUVEAU: Créer les questions si fournies
      let createdQuestions = [];
      if (questions && Array.isArray(questions) && questions.length > 0) {
        console.log('📝 Creating', questions.length, 'questions for exam:', newExam.id);

        createdQuestions = questions.map((questionData, index) => {
          const { type, text, points, allowMultiple, options, correctAnswer } = questionData;

          // Validation
          if (!type || !text || !points) {
            throw new Error(`Question ${index + 1}: Missing required fields`);
          }

          // Créer la question
          const newQuestion = db.createQuestion({
            examId: newExam.id,
            type,
            text,
            points,
            allowMultiple: allowMultiple || false,  // ✅ Ajouter allowMultiple
            order: index + 1,
            options: type === 'MCQ' ? options : undefined,
            correctAnswer: type === 'TRUE_FALSE' ? correctAnswer : undefined,
          });

          console.log(`✅ Question ${index + 1} created:`, newQuestion.id);
          return newQuestion;
        });
      }

      // Retourner l'examen avec les questions créées
      const enrichedExam = {
        ...newExam,
        questions: createdQuestions,
        questionCount: createdQuestions.length,
        totalPoints: createdQuestions.reduce((sum, q) => sum + (q.points || 0), 0),
      };

      resolve(Service.successResponse(enrichedExam, 201));
    } catch (e) {
      console.error('❌ Error in teacherExamsPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to create exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Update an exam
 */
const teacherExamsExamIdPUT = (params) => new Promise(
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

      // Ne pas permettre la modification si l'examen est publié et a des tentatives
      const attempts = db.getAttemptsByExam(params.examId);
      if (exam.status === 'PUBLISHED' && attempts.length > 0) {
        return reject(Service.rejectResponse('Cannot modify exam with existing attempts', 400));
      }

      const updates = params.updateExamRequest || params.body || params;
      const updatedExam = db.updateExam(params.examId, updates);

      console.log('✅ Exam updated:', updatedExam.id);
      resolve(Service.successResponse(updatedExam));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdPUT:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to update exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Delete an exam
 */
const teacherExamsExamIdDELETE = (params) => new Promise(
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

      // Ne pas permettre la suppression si l'examen a des tentatives
      const attempts = db.getAttemptsByExam(params.examId);
      if (attempts.length > 0) {
        return reject(Service.rejectResponse('Cannot delete exam with existing attempts', 400));
      }

      // Supprimer les questions associées
      db.deleteQuestionsByExam(params.examId);

      // Supprimer l'examen
      db.deleteExam(params.examId);

      console.log('✅ Exam deleted');
      resolve(Service.successResponse({}, 204));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdDELETE:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to delete exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Publish an exam (change status from DRAFT to PUBLISHED)
 */
const teacherExamsExamIdPublishPOST = (params) => new Promise(
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

      // Vérifier qu'il y a au moins une question
      const questions = db.getQuestionsByExam(params.examId);
      if (questions.length === 0) {
        return reject(Service.rejectResponse('Cannot publish exam without questions', 400));
      }

      // Publier l'examen
      const updatedExam = db.updateExam(params.examId, { status: 'PUBLISHED' });

      console.log('✅ Exam published:', updatedExam.id);
      resolve(Service.successResponse(updatedExam));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdPublishPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to publish exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Add a question to an exam
 */
const teacherExamsExamIdQuestionsPOST = (params) => new Promise(
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

      // Ne pas permettre l'ajout de questions si l'examen est publié
      if (exam.status === 'PUBLISHED') {
        return reject(Service.rejectResponse('Cannot add questions to published exam', 400));
      }

      const questionData = params.createQuestionRequest || params.body || params;
      const { type, text, points, allowMultiple, options, correctAnswer } = questionData;

      // Validation
      if (!type || !text || !points) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      // Déterminer l'ordre de la question
      const existingQuestions = db.getQuestionsByExam(params.examId);
      const order = existingQuestions.length + 1;

      // Créer la question
      const newQuestion = db.createQuestion({
        examId: params.examId,
        type,
        text,
        points,
        allowMultiple: allowMultiple || false,  // ✅ Ajouter allowMultiple
        order,
        options: type === 'MCQ' ? options : undefined,
        correctAnswer: type === 'TRUE_FALSE' ? correctAnswer : undefined,
      });

      console.log('✅ Question added to exam:', params.examId);
      resolve(Service.successResponse(newQuestion, 201));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdQuestionsPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to add question',
        e.status || 500
      ));
    }
  },
);

/**
 * Update a question
 */
const teacherExamsExamIdQuestionsQuestionIdPUT = (params) => new Promise(
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

      // Ne pas permettre la modification si l'examen est publié
      if (exam.status === 'PUBLISHED') {
        return reject(Service.rejectResponse('Cannot modify questions of published exam', 400));
      }

      const question = db.getQuestionById(params.questionId);
      if (!question || question.examId !== params.examId) {
        return reject(Service.rejectResponse('Question not found', 404));
      }

      const updates = params.updateQuestionRequest || params.body || params;
      const updatedQuestion = db.updateQuestion(params.questionId, updates);

      console.log('✅ Question updated');
      resolve(Service.successResponse(updatedQuestion));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdQuestionsQuestionIdPUT:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to update question',
        e.status || 500
      ));
    }
  },
);

/**
 * Delete a question
 */
const teacherExamsExamIdQuestionsQuestionIdDELETE = (params) => new Promise(
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

      // Ne pas permettre la suppression si l'examen est publié
      if (exam.status === 'PUBLISHED') {
        return reject(Service.rejectResponse('Cannot delete questions from published exam', 400));
      }

      const question = db.getQuestionById(params.questionId);
      if (!question || question.examId !== params.examId) {
        return reject(Service.rejectResponse('Question not found', 404));
      }

      db.deleteQuestion(params.questionId);

      console.log('✅ Question deleted');
      resolve(Service.successResponse({}, 204));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdQuestionsQuestionIdDELETE:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to delete question',
        e.status || 500
      ));
    }
  },
);

/**
 * Get all attempts for an exam (for grading)
 */
const teacherExamsExamIdAttemptsGET = (params) => new Promise(
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

      // Récupérer toutes les tentatives
      const attempts = db.getAttemptsByExam(params.examId);

      // Enrichir avec les infos de l'étudiant et les réponses
      const enrichedAttempts = attempts.map(attempt => {
        const student = db.getUserById(attempt.studentId);
        const answers = db.getAnswersByAttempt(attempt.id);
        const result = db.getResultByAttempt(attempt.id);

        return {
          ...attempt,
          student: student ? {
            id: student.id,
            email: student.email,
            firstName: student.firstName,
            lastName: student.lastName,
          } : null,
          answerCount: answers.length,
          result,
        };
      });

      resolve(Service.successResponse(enrichedAttempts));
    } catch (e) {
      console.error('❌ Error in teacherExamsExamIdAttemptsGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch attempts',
        e.status || 500
      ));
    }
  },
);

module.exports = {
  teacherExamsGET,
  teacherExamsExamIdGET,
  teacherExamsPOST,
  teacherExamsExamIdPUT,
  teacherExamsExamIdDELETE,
  teacherExamsExamIdPublishPOST,
  teacherExamsExamIdQuestionsPOST,
  teacherExamsExamIdQuestionsQuestionIdPUT,
  teacherExamsExamIdQuestionsQuestionIdDELETE,
  teacherExamsExamIdAttemptsGET,
};
