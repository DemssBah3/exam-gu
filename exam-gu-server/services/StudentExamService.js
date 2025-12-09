/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

/**
 * ✅ FIX: Fonction helper pour évaluer une réponse
 * Gère QCM mono/multi, Vrai/Faux, Questions ouvertes
 */
const evaluateAnswer = (question, answer) => {
  if (!answer) {
    return { pointsAwarded: 0 };
  }

  if (question.type === 'MCQ') {
    // ✅ QCM: Déterminer si mono ou multi-choix
    const isSingleChoice = !question.allowMultiple;
    
    if (isSingleChoice) {
      // Mono-choix: comparer une seule réponse
      const correctOption = question.options.find(opt => opt.isCorrect);
      if (correctOption && answer.selectedOption === correctOption.id) {
        return { pointsAwarded: question.points };
      }
    } else {
      // ✅ Multi-choix: comparer un ARRAY
      const studentAnswers = Array.isArray(answer.selectedOptions) 
        ? answer.selectedOptions 
        : (answer.selectedOption ? [answer.selectedOption] : []);
      
      const correctOptions = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

      console.log('🔍 Multi-choice evaluation for Q' + question.id);
      console.log('  Student answers:', studentAnswers);
      console.log('  Correct options:', correctOptions);

      // ✅ Vérifier que TOUS les bonnes réponses sont sélectionnées
      const isCorrect = 
        studentAnswers.length === correctOptions.length &&
        studentAnswers.every(ans => correctOptions.includes(ans));

      console.log('  Is correct?', isCorrect);
      
      if (isCorrect) {
        return { pointsAwarded: question.points };
      }
    }
    return { pointsAwarded: 0 };
  } 
  else if (question.type === 'TRUE_FALSE') {
    // ✅ FIX: Normaliser boolean vs string + français/anglais
    let studentAnswer = answer.booleanAnswer;
    let correctAnswer = question.correctAnswer;

    // Convertir en string et normaliser
    studentAnswer = String(studentAnswer).toLowerCase().trim();
    correctAnswer = String(correctAnswer).toLowerCase().trim();

    // Gérer français ET anglais
    const trueValues = ['true', 'vrai', '1', 'oui', 'yes'];
    const falseValues = ['false', 'faux', '0', 'non', 'no'];

    const studentIsTrue = trueValues.includes(studentAnswer);
    const studentIsFalse = falseValues.includes(studentAnswer);
    const correctIsTrue = trueValues.includes(correctAnswer);
    const correctIsFalse = falseValues.includes(correctAnswer);

    console.log('🔍 True/False evaluation for Q' + question.id);
    console.log('  Student answer (raw):', answer.booleanAnswer);
    console.log('  Student answer (normalized):', studentAnswer);
    console.log('  Correct answer (raw):', question.correctAnswer);
    console.log('  Correct answer (normalized):', correctAnswer);
    console.log('  Student is TRUE?', studentIsTrue, 'FALSE?', studentIsFalse);
    console.log('  Correct is TRUE?', correctIsTrue, 'FALSE?', correctIsFalse);

    // Vérifier si les deux correspondent
    const isCorrect = 
      (studentIsTrue && correctIsTrue) || 
      (studentIsFalse && correctIsFalse);

    console.log('  Is correct?', isCorrect);
    
    if (isCorrect) {
      return { pointsAwarded: question.points };
    }
    return { pointsAwarded: 0 };
  } 
  else if (question.type === 'OPEN_ENDED') {
    // Pour les questions ouvertes, on récupère les points attribués manuellement
    return { pointsAwarded: 0 };  // À corriger manuellement
  }

  return { pointsAwarded: 0 };
};


/**
 * Get available exams for the student
 */
const studentExamsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      // Récupérer les examens des sessions auxquelles l'étudiant est inscrit
      const exams = db.getExamsForStudent(params.userId);

      // Filtrer uniquement les examens publiés
      const publishedExams = exams.filter(e => e.status === 'PUBLISHED');

      // Enrichir avec les infos et les tentatives de l'étudiant
      const enrichedExams = publishedExams.map(exam => {
        const session = db.getSessionById(exam.sessionId);
        const course = session ? db.getCourseById(session.courseId) : null;
        const questions = db.getQuestionsByExam(exam.id);
        
        // Récupérer les tentatives de l'étudiant pour cet examen
        const attempts = db.getAttemptsByStudentAndExam(params.userId, exam.id);
        const completedAttempts = attempts.filter(a => a.status === 'SUBMITTED');
        
        // Vérifier si l'examen est disponible (dans la période)
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);
        const isAvailable = now >= start && now <= end;
        const isUpcoming = now < start;
        const isExpired = now > end;
        
        // Vérifier s'il peut encore passer l'examen
        const canAttempt = isAvailable && attempts.length < exam.maxAttempts;
        
        // Tentative en cours
        const currentAttempt = attempts.find(a => a.status === 'IN_PROGRESS');

        return {
          ...exam,
          session,
          course,
          questionCount: questions.length,
          totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
          attemptCount: attempts.length,
          completedAttempts: completedAttempts.length,
          canAttempt,
          isAvailable,
          isUpcoming,
          isExpired,
          hasCurrentAttempt: !!currentAttempt,
          currentAttemptId: currentAttempt?.id,
        };
      });

      console.log('✅ Found', enrichedExams.length, 'exams for student');
      resolve(Service.successResponse(enrichedExams));
    } catch (e) {
      console.error('❌ Error in studentExamsGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch exams',
        e.status || 500
      ));
    }
  },
);

/**
 * Get exam details for student (without answers for MCQ/TRUE_FALSE)
 */
const studentExamsExamIdGET = (params) => new Promise(
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

      // Vérifier que l'examen est publié
      if (exam.status !== 'PUBLISHED') {
        return reject(Service.rejectResponse('Exam not available', 403));
      }

      // Vérifier que l'étudiant est inscrit à la session
      if (!db.isStudentEnrolled(params.userId, exam.sessionId)) {
        return reject(Service.rejectResponse('Not enrolled in this session', 403));
      }

      const session = db.getSessionById(exam.sessionId);
      const course = session ? db.getCourseById(session.courseId) : null;
      const questions = db.getQuestionsByExam(exam.id);
      
      // Masquer les réponses correctes pour les étudiants
      const sanitizedQuestions = questions.map(q => {
        if (q.type === 'MCQ') {
          return {
            ...q,
            options: q.options.map(opt => ({
              id: opt.id,
              text: opt.text,
              // Ne pas inclure isCorrect
            })),
          };
        } else if (q.type === 'TRUE_FALSE') {
          return {
            id: q.id,
            examId: q.examId,
            type: q.type,
            text: q.text,
            points: q.points,
            order: q.order,
            // Ne pas inclure correctAnswer
          };
        }
        return q;
      });

      // Tentatives de l'étudiant
      const attempts = db.getAttemptsByStudentAndExam(params.userId, exam.id);

      const enrichedExam = {
        ...exam,
        session,
        course,
        questions: sanitizedQuestions,
        questionCount: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        attemptCount: attempts.length,
        attempts: attempts.map(a => ({
          id: a.id,
          status: a.status,
          startTime: a.startTime,
          endTime: a.endTime,
          score: a.score,
        })),
      };

      resolve(Service.successResponse(enrichedExam));
    } catch (e) {
      console.error('❌ Error in studentExamsExamIdGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Start an exam attempt
 */
const studentExamsExamIdStartPOST = (params) => new Promise(
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

      // Vérifications
      if (exam.status !== 'PUBLISHED') {
        return reject(Service.rejectResponse('Exam not available', 403));
      }

      if (!db.isStudentEnrolled(params.userId, exam.sessionId)) {
        return reject(Service.rejectResponse('Not enrolled in this session', 403));
      }

      // Vérifier la période
      const now = new Date();
      const start = new Date(exam.startTime);
      const end = new Date(exam.endTime);
      
      if (now < start) {
        return reject(Service.rejectResponse('Exam has not started yet', 400));
      }
      
      if (now > end) {
        return reject(Service.rejectResponse('Exam has ended', 400));
      }

      // Vérifier le nombre de tentatives
      const attempts = db.getAttemptsByStudentAndExam(params.userId, exam.id);
      
      if (attempts.length >= exam.maxAttempts) {
        return reject(Service.rejectResponse('Maximum attempts reached', 400));
      }

      // Vérifier s'il y a déjà une tentative en cours
      const currentAttempt = attempts.find(a => a.status === 'IN_PROGRESS');
      if (currentAttempt) {
        return reject(Service.rejectResponse('You already have an attempt in progress', 400));
      }

      // Créer une nouvelle tentative
      const newAttempt = db.createAttempt({
        examId: exam.id,
        studentId: params.userId,
      });

      console.log('✅ Exam attempt started:', newAttempt.id);
      resolve(Service.successResponse(newAttempt, 201));
    } catch (e) {
      console.error('❌ Error in studentExamsExamIdStartPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to start exam',
        e.status || 500
      ));
    }
  },
);

/**
 * Get current attempt details
 */
const studentExamsExamIdAttemptsAttemptIdGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      // Vérifier que c'est bien la tentative de l'étudiant
      if (attempt.studentId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      const exam = db.getExamById(attempt.examId);
      const questions = db.getQuestionsByExam(exam.id);
      
      // Récupérer les réponses déjà soumises
      const answers = db.getAnswersByAttempt(attempt.id);

      // Masquer les réponses correctes
      const sanitizedQuestions = questions.map(q => {
        const studentAnswer = answers.find(a => a.questionId === q.id);
        
        if (q.type === 'MCQ') {
          return {
            ...q,
            options: q.options.map(opt => ({
              id: opt.id,
              text: opt.text,
            })),
            studentAnswer: studentAnswer?.selectedOption,
          };
        } else if (q.type === 'TRUE_FALSE') {
          return {
            id: q.id,
            examId: q.examId,
            type: q.type,
            text: q.text,
            points: q.points,
            order: q.order,
            studentAnswer: studentAnswer?.booleanAnswer,
          };
        } else if (q.type === 'OPEN_ENDED') {
          return {
            ...q,
            studentAnswer: studentAnswer?.textAnswer,
          };
        }
        return q;
      });

      const enrichedAttempt = {
        ...attempt,
        exam,
        questions: sanitizedQuestions,
        timeRemaining: exam.duration * 60, // en secondes
      };

      resolve(Service.successResponse(enrichedAttempt));
    } catch (e) {
      console.error('❌ Error in studentExamsExamIdAttemptsAttemptIdGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch attempt',
        e.status || 500
      ));
    }
  },
);

/**
 * Save answer for a question
 */
const studentExamsExamIdAttemptsAttemptIdAnswersPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      // Vérifier que c'est bien la tentative de l'étudiant
      if (attempt.studentId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      // Vérifier que la tentative est en cours
      if (attempt.status !== 'IN_PROGRESS') {
        return reject(Service.rejectResponse('Attempt is not in progress', 400));
      }

      const answerData = params.body || params;
      const { questionId, selectedOption, selectedOptions, booleanAnswer, textAnswer } = answerData;

      if (!questionId) {
        return reject(Service.rejectResponse('Question ID is required', 400));
      }

      // ✅ Gérer both selectedOption (mono) et selectedOptions (multi)
      const answer = db.upsertAnswer(params.attemptId, questionId, {
        selectedOption,
        selectedOptions,
        booleanAnswer,
        textAnswer,
      });

      console.log('✅ Answer saved for question:', questionId);
      resolve(Service.successResponse(answer));
    } catch (e) {
      console.error('❌ Error in studentExamsExamIdAttemptsAttemptIdAnswersPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to save answer',
        e.status || 500
      ));
    }
  },
);

/**
 * Submit exam attempt
 */
const studentExamsExamIdAttemptsAttemptIdSubmitPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      console.log('=== SUBMIT EXAM DEBUG ===');
      console.log('Attempt ID:', params.attemptId);
      console.log('========================');

      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      const attempt = db.getAttemptById(params.attemptId);
      if (!attempt) {
        return reject(Service.rejectResponse('Attempt not found', 404));
      }

      // Vérifier que c'est bien la tentative de l'étudiant
      if (attempt.studentId !== params.userId) {
        return reject(Service.rejectResponse('Access denied', 403));
      }

      // Vérifier que la tentative est en cours
      if (attempt.status !== 'IN_PROGRESS') {
        return reject(Service.rejectResponse('Attempt already submitted', 400));
      }

      const exam = db.getExamById(attempt.examId);
      const questions = db.getQuestionsByExam(exam.id);
      const answers = db.getAnswersByAttempt(attempt.id);

      console.log('📊 Questions:', questions.length);
      console.log('📊 Answers:', answers.length);

      // ✅ Calculer le score automatiquement pour MCQ et TRUE_FALSE
      let totalScore = 0;
      let maxScore = 0;

      questions.forEach(question => {
        maxScore += question.points;
        const answer = answers.find(a => a.questionId === question.id);

        // ✅ Utiliser la fonction helper evaluateAnswer
        const { pointsAwarded } = evaluateAnswer(question, answer);
        totalScore += pointsAwarded;

        console.log(`  Q${question.id} (${question.type}): ${pointsAwarded}/${question.points}`);
      });

      console.log('📊 Total score:', totalScore, '/', maxScore);

      // Mettre à jour la tentative
      const updatedAttempt = db.updateAttempt(params.attemptId, {
        status: 'SUBMITTED',
        endTime: new Date().toISOString(),
        score: totalScore,
      });

      console.log('✅ Exam submitted with score:', totalScore, '/', maxScore);
      
      resolve(Service.successResponse({
        ...updatedAttempt,
        totalScore,
        maxScore,
      }));
    } catch (e) {
      console.error('❌ Error in studentExamsExamIdAttemptsAttemptIdSubmitPOST:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to submit exam',
        e.status || 500
      ));
    }
  },
);


module.exports = {
  studentExamsGET,
  studentExamsExamIdGET,
  studentExamsExamIdStartPOST,
  studentExamsExamIdAttemptsAttemptIdGET,
  studentExamsExamIdAttemptsAttemptIdAnswersPOST,
  studentExamsExamIdAttemptsAttemptIdSubmitPOST,
};
