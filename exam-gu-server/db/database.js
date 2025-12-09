/**
 * In-memory database pour le prototype/développement
 * À remplacer par une véritable BD en production (PostgreSQL, MongoDB, etc.)
 */
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.users = [];
    this.courses = [];
    this.sessions = [];
    this.exams = [];
    this.questions = [];
    this.enrollments = [];
    this.courseAssignments = [];
    this.attempts = [];
    this.answers = [];
    this.results = [];
    this.loginLogs = [];

    // Données de démonstration - SYNCHRONE
    this.seedDemoData();
  }

  seedDemoData() {
    // ✅ Hash PRÉ-GÉNÉRÉ de "password123" avec Bcrypt (10 rounds)
    // Pour régénérer: npm install -g bcrypt-cli && echo 'password123' | bcrypt
    const hashedPassword = '$2a$10$OWn5TLIpt8R7VyMC4g3aiOoIEkEfO1Pw/rCgabIVoVoWl1GDEjlzC';

    // Créer un utilisateur admin de démonstration
    const adminId = uuidv4();
    this.users.push({
      id: adminId,
      email: 'admin@uqac.ca',
      password: hashedPassword,  // ✅ Hash Bcrypt
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    });

    // Créer un utilisateur enseignant de démonstration
    const teacherId = uuidv4();
    this.users.push({
      id: teacherId,
      email: 'teacher@uqac.ca',
      password: hashedPassword,  // ✅ Hash Bcrypt
      firstName: 'Teacher',
      lastName: 'Test',
      role: 'TEACHER',
      createdAt: new Date().toISOString(),
    });

    // Créer un utilisateur étudiant de démonstration
    const studentId = uuidv4();
    this.users.push({
      id: studentId,
      email: 'student@uqac.ca',
      password: hashedPassword,  // ✅ Hash Bcrypt
      firstName: 'Student',
      lastName: 'Test',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    });

    // Créer un cours de démonstration
    const courseId = uuidv4();
    this.courses.push({
      id: courseId,
      code: 'INF111',
      title: 'Programmation I',
      description: 'Introduction à la programmation',
      credits: 3,
      createdAt: new Date().toISOString(),
    });

    // Créer une session de démonstration
    const sessionId = uuidv4();
    this.sessions.push({
      id: sessionId,
      courseId,
      semester: 'Winter2025',
      startDate: '2025-01-06',
      endDate: '2025-12-30',
      createdAt: new Date().toISOString(),
    });

    // Créer une assignation de cours (teacher -> session)
    this.courseAssignments.push({
      id: uuidv4(),
      teacherId,
      sessionId,
      assignedAt: new Date().toISOString(),
    });

    // Créer une inscription (student -> session)
    this.enrollments.push({
      id: uuidv4(),
      studentId,
      sessionId,
      enrolledAt: new Date().toISOString(),
    });

    // Créer un examen de démonstration
    const examId = uuidv4();
    this.exams.push({
      id: examId,
      title: 'Examen Final - INF111',
      description: 'Examen final du cours Programmation I',
      sessionId,
      courseId,
      teacherId,
      duration: 120,
      startTime: '2025-04-15T10:00:00Z',
      endTime: '2025-12-30T12:00:00Z',
      maxAttempts: 2,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibilityConfig: {
        showScore: true,
        showAnswers: true,
        showCorrectAnswers: true,
        showFeedback: true,
      },
    });

    // Créer des questions de démonstration
    // ✅ UTILISER DES IDS FIXES (pas uuidv4())
const q1OptionIds = {
  null: 'q1-opt-null',
  object: 'q1-opt-object',
  undefined: 'q1-opt-undefined',
  number: 'q1-opt-number',
};

const q1Id = 'q1-demo-001';
this.questions.push({
  id: q1Id,
  examId,
  type: 'MCQ',
  text: 'Quelle est la sortie de console.log(typeof null)?',
  points: 5,
  order: 1,
  allowMultiple: true,  // ✅ AJOUTER CECI!
  options: [
    { id: 'q1-opt-null', text: 'null', isCorrect: false },
    { id: 'q1-opt-object', text: 'object', isCorrect: true },
    { id: 'q1-opt-undefined', text: 'undefined', isCorrect: true },
    { id: 'q1-opt-number', text: 'number', isCorrect: false },
  ],
});

// Question 2 (une seule bonne réponse)
const q2Id = 'q2-demo-001';
this.questions.push({
  id: q2Id,
  examId,
  type: 'MCQ',  // ✅ Changé de TRUE_FALSE à MCQ pour tester
  text: 'Quelle est la capitale de la France?',
  points: 5,
  order: 2,
  allowMultiple: false,  // ✅ Une seule réponse
  options: [
    { id: 'q2-opt-paris', text: 'Paris', isCorrect: true },
    { id: 'q2-opt-lyon', text: 'Lyon', isCorrect: false },
    { id: 'q2-opt-marseille', text: 'Marseille', isCorrect: false },
  ],
});


const q3Id = 'q3-demo-001';  // ✅ ID FIXE
this.questions.push({
  id: q3Id,
  examId,
  type: 'TRUE_FALSE',
  text: 'Les variables déclarées avec var sont function-scoped.',
  points: 3,
  order: 2,
  correctAnswer: true,
});

const q4Id = 'q4-demo-001';  // ✅ ID FIXE
this.questions.push({
  id: q4Id,
  examId,
  type: 'OPEN_ENDED',
  text: 'Expliquez la différence entre == et === en JavaScript.',
  points: 10,
  order: 3,
});

// Mettre à jour les IDs de démo
this.demoIds = {
  adminId,
  teacherId,
  studentId,
  courseId,
  sessionId,
  examId,
  q1Id,
  q2Id,
  q3Id,
  q4Id,
};
  }

  // ==================== USERS ====================
  getAllUsers(role = null) {
    if (role) {
      return this.users.filter((u) => u.role === role);
    }
    return this.users;
  }

  getUserById(id) {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email) {
    return this.users.find((u) => u.email === email);
  }

  createUser(userData) {
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  updateUser(id, updates) {
    const user = this.getUserById(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    Object.assign(user, updated);
    return user;
  }

  deleteUser(id) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  // ==================== COURSES ====================
  getAllCourses() {
    return this.courses;
  }

  getCourseById(id) {
    return this.courses.find((c) => c.id === id);
  }

  createCourse(courseData) {
    const course = {
      id: uuidv4(),
      ...courseData,
      createdAt: new Date().toISOString(),
    };
    this.courses.push(course);
    return course;
  }

  updateCourse(id, updates) {
    const course = this.getCourseById(id);
    if (!course) return null;
    Object.assign(course, updates);
    return course;
  }

  deleteCourse(id) {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.courses.splice(idx, 1);
    return true;
  }

  // ==================== SESSIONS ====================
  getAllSessions() {
    return this.sessions;
  }

  getSessionById(id) {
    return this.sessions.find((s) => s.id === id);
  }

  createSession(sessionData) {
    const session = {
      id: uuidv4(),
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    this.sessions.push(session);
    return session;
  }

  updateSession(id, updates) {
    const session = this.getSessionById(id);
    if (!session) return null;
    Object.assign(session, updates);
    return session;
  }

  deleteSession(id) {
    const idx = this.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.sessions.splice(idx, 1);
    return true;
  }

  // ==================== EXAMS ====================
  getAllExams() {
    return this.exams;
  }

  getExamById(id) {
    return this.exams.find((e) => e.id === id);
  }

  getExamsByTeacher(teacherId) {
    return this.exams.filter((e) => e.teacherId === teacherId);
  }

  getExamsBySession(sessionId) {
    return this.exams.filter((e) => e.sessionId === sessionId);
  }

  getExamsForStudent(studentId) {
    const enrollments = this.enrollments.filter(e => e.studentId === studentId);
    const sessionIds = enrollments.map(e => e.sessionId);
    return this.exams.filter(e => sessionIds.includes(e.sessionId));
  }

  createExam(examData) {
    const exam = {
      id: uuidv4(),
      ...examData,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.exams.push(exam);
    return exam;
  }

  updateExam(id, updates) {
    const exam = this.getExamById(id);
    if (!exam) return null;
    Object.assign(exam, updates, { updatedAt: new Date().toISOString() });
    return exam;
  }

  deleteExam(id) {
    const idx = this.exams.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.exams.splice(idx, 1);
    return true;
  }

  // ==================== QUESTIONS ====================
  getQuestionsByExam(examId) {
    return this.questions.filter((q) => q.examId === examId).sort((a, b) => a.order - b.order);
  }

  getQuestionById(id) {
    return this.questions.find((q) => q.id === id);
  }

 createQuestion(questionData) {
  const question = {
    id: uuidv4(),
    ...questionData,
  };

  // ✅ GÉNÉRER LES IDs POUR LES OPTIONS MCQ
  if (question.type === 'MCQ' && question.options && Array.isArray(question.options)) {
    question.options = question.options.map((opt, optIdx) => ({
      id: `opt-${question.id}-${optIdx}`,  // Génère un ID unique
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));
  }

  this.questions.push(question);
  return question;
}


  updateQuestion(id, updates) {
  const question = this.getQuestionById(id);
  if (!question) return null;
  Object.assign(question, updates);

  // ✅ RÉGÉNÉRER LES IDs SI LES OPTIONS SONT MISES À JOUR
  if (question.type === 'MCQ' && question.options && Array.isArray(question.options)) {
    question.options = question.options.map((opt, optIdx) => ({
      id: opt.id || `opt-${question.id}-${optIdx}`,  // Garde l'ID s'il existe, sinon le génère
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));
  }

  return question;
}


  deleteQuestion(id) {
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    this.questions.splice(idx, 1);
    return true;
  }

  deleteQuestionsByExam(examId) {
    this.questions = this.questions.filter((q) => q.examId !== examId);
  }

  // ==================== ATTEMPTS ====================
  getAttemptsByStudent(studentId) {
    return this.attempts.filter((a) => a.studentId === studentId);
  }

  getAttemptsByExam(examId) {
    return this.attempts.filter((a) => a.examId === examId);
  }

  getAttemptsByStudentAndExam(studentId, examId) {
    return this.attempts.filter((a) => a.studentId === studentId && a.examId === examId);
  }

  getAttemptById(id) {
    return this.attempts.find((a) => a.id === id);
  }

  createAttempt(attemptData) {
    const attempt = {
      id: uuidv4(),
      ...attemptData,
      status: 'IN_PROGRESS',
      startTime: new Date().toISOString(),
    };
    this.attempts.push(attempt);
    return attempt;
  }

  updateAttempt(id, updates) {
    const attempt = this.getAttemptById(id);
    if (!attempt) return null;
    Object.assign(attempt, updates);
    return attempt;
  }

  // ==================== ANSWERS ====================
  getAnswersByAttempt(attemptId) {
    return this.answers.filter((a) => a.attemptId === attemptId);
  }

  getAnswerByAttemptQuestion(attemptId, questionId) {
    return this.answers.find((a) => a.attemptId === attemptId && a.questionId === questionId);
  }

  createAnswer(answerData) {
    const answer = {
      id: uuidv4(),
      ...answerData,
      submittedAt: new Date().toISOString(),
      pointsAwarded: null, 
      feedback: null,
    };
    this.answers.push(answer);
    return answer;
  }

  updateAnswer(id, updates) {
    const answer = this.answers.find((a) => a.id === id);
    if (!answer) return null;
    Object.assign(answer, updates, { submittedAt: new Date().toISOString() });
    return answer;
  }

  upsertAnswer(attemptId, questionId, answerData) {
    const existing = this.getAnswerByAttemptQuestion(attemptId, questionId);
    if (existing) {
      return this.updateAnswer(existing.id, answerData);
    } else {
      return this.createAnswer({ attemptId, questionId, ...answerData });
    }
  }

  // ==================== RESULTS ====================
  getResultsByExam(examId) {
    return this.results.filter((r) => r.examId === examId);
  }

  getResultById(id) {
    return this.results.find((r) => r.id === id);
  }

  getResultByAttempt(attemptId) {
    return this.results.find((r) => r.attemptId === attemptId);
  }

  createResult(resultData) {
    const result = {
      id: uuidv4(),
      ...resultData,
      status: 'IN_GRADING',
      submittedAt: new Date().toISOString(),
    };
    this.results.push(result);
    return result;
  }

  updateResult(id, updates) {
    const result = this.getResultById(id);
    if (!result) return null;
    Object.assign(result, updates);
    return result;
  }

  // ==================== ENROLLMENTS ====================
  getEnrollmentById(id) {
    return this.enrollments.find((e) => e.id === id);
  }

  getAllEnrollments() {
    return this.enrollments;
  }

  isStudentEnrolled(studentId, sessionId) {
    return this.enrollments.some(e => e.studentId === studentId && e.sessionId === sessionId);
  }

  createEnrollment(enrollmentData) {
    const enrollment = {
      id: uuidv4(),
      ...enrollmentData,
      enrolledAt: new Date().toISOString(),
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  deleteEnrollment(id) {
    const idx = this.enrollments.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.enrollments.splice(idx, 1);
    return true;
  }

  // ==================== COURSE ASSIGNMENTS ====================
  getAssignmentById(id) {
    return this.courseAssignments.find((a) => a.id === id);
  }

  getAllAssignments() {
    return this.courseAssignments;
  }

  isTeacherAssigned(teacherId, sessionId) {
    return this.courseAssignments.some(a => a.teacherId === teacherId && a.sessionId === sessionId);
  }

  createAssignment(assignmentData) {
    const assignment = {
      id: uuidv4(),
      ...assignmentData,
      assignedAt: new Date().toISOString(),
    };
    this.courseAssignments.push(assignment);
    return assignment;
  }

  deleteAssignment(id) {
    const idx = this.courseAssignments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.courseAssignments.splice(idx, 1);
    return true;
  }

  // ==================== LOGIN LOGS ====================
  addLoginLog(userId, ipAddress, userAgent) {
    const log = {
      id: uuidv4(),
      userId,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
    };
    this.loginLogs.push(log);
    return log;
  }

  getLoginLogsByUser(userId) {
    return this.loginLogs.filter((log) => log.userId === userId);
  }
}

// Singleton
let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

module.exports = { getDatabase };
