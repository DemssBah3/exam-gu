/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

// ==================== EXAMS ====================

const examsGET = (args, req) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = req.userId;
      const role = req.role;

      let exams = [];

      if (role === 'ADMIN') {
        exams = db.getAllExams();
      } else if (role === 'TEACHER') {
        exams = db.getExamsByTeacher(userId);
      } else if (role === 'STUDENT') {
        // Retourner les examens des sessions inscrites
        const enrollments = db.getAllEnrollments().filter((e) => e.studentId === userId);
        const sessionIds = enrollments.map((e) => e.sessionId);
        exams = db.getAllExams().filter((e) => sessionIds.includes(e.sessionId) && e.status === 'ACTIVE');
      }

      const response = exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        sessionId: exam.sessionId,
        courseId: exam.courseId,
        teacherId: exam.teacherId,
        duration: exam.duration,
        startTime: exam.startTime,
        endTime: exam.endTime,
        maxAttempts: exam.maxAttempts,
        status: exam.status,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
      }));

      resolve(Service.successResponse(response));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

const examsPOST = ({ createExamRequest, userId, role }) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();

      if (role !== 'TEACHER' && role !== 'ADMIN') {
        return reject(Service.rejectResponse(
          'Only teachers can create exams',
          403,
        ));
      }

      const exam = db.createExam({
        ...createExamRequest,
        teacherId: userId,
      });

      resolve(Service.successResponse(exam, 201));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

const examsExamIdGET = ({ examId }) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      const exam = db.getExamById(examId);

      if (!exam) {
        return reject(Service.rejectResponse(
          'Exam not found',
          404,
        ));
      }

      const questions = db.getQuestionsByExam(examId);
      const response = {
        ...exam,
        questions,
        questionCount: questions.length,
      };

      resolve(Service.successResponse(response));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

const examsExamIdPUT = ({ examId, updateExamRequest, userId, role }) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();

      const exam = db.getExamById(examId);
      if (!exam) {
        return reject(Service.rejectResponse(
          'Exam not found',
          404,
        ));
      }

      if (exam.teacherId !== userId && role !== 'ADMIN') {
        return reject(Service.rejectResponse(
          'Not authorized',
          403,
        ));
      }

      if (exam.status !== 'DRAFT') {
        return reject(Service.rejectResponse(
          'Can only edit exams in DRAFT status',
          400,
        ));
      }

      const updated = db.updateExam(examId, updateExamRequest);
      resolve(Service.successResponse(updated));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

const examsExamIdDELETE = ({ examId, userId, role }) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();

      const exam = db.getExamById(examId);
      if (!exam) {
        return reject(Service.rejectResponse(
          'Exam not found',
          404,
        ));
      }

      if (exam.teacherId !== userId && role !== 'ADMIN') {
        return reject(Service.rejectResponse(
          'Not authorized',
          403,
        ));
      }

      if (exam.status !== 'DRAFT') {
        return reject(Service.rejectResponse(
          'Can only delete exams in DRAFT status',
          400,
        ));
      }

      db.deleteExam(examId);
      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

const examsExamIdStatusPUT = ({ examId, examsExamIdStatusPutRequest, userId, role }) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      const { status } = examsExamIdStatusPutRequest;

      const exam = db.getExamById(examId);
      if (!exam) {
        return reject(Service.rejectResponse(
          'Exam not found',
          404,
        ));
      }

      if (exam.teacherId !== userId && role !== 'ADMIN') {
        return reject(Service.rejectResponse(
          'Not authorized',
          403,
        ));
      }

      // Valider les transitions de statut
      const validTransitions = {
        DRAFT: ['ACTIVE'],
        ACTIVE: ['CLOSED', 'IN_GRADING'],
        CLOSED: ['IN_GRADING'],
        IN_GRADING: ['GRADED'],
        GRADED: [],
      };

      if (!validTransitions[exam.status] || !validTransitions[exam.status].includes(status)) {
        return reject(Service.rejectResponse(
          `Invalid status transition from ${exam.status} to ${status}`,
          400,
        ));
      }

      const updated = db.updateExam(examId, { status });
      resolve(Service.successResponse(updated));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  examsExamIdDELETE,
  examsExamIdGET,
  examsExamIdPUT,
  examsExamIdStatusPUT,
  examsGET,
  examsPOST,
};
