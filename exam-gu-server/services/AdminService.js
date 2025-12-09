/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');
const passwordUtils = require('../utils/passwordUtils');  // ✅ AJOUTER CETTE LIGNE

// ==========================================
// USERS
// ==========================================

const adminUsersGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const roleFilter = params.roleFilter;
      const users = roleFilter ? db.getAllUsers(roleFilter) : db.getAllUsers();

      console.log('✅ Found', users.length, 'users');

      const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      }));

      resolve(Service.successResponse(safeUsers));
    } catch (e) {
      console.error('❌ Error in adminUsersGET:', e.message);
      reject(Service.rejectResponse(e.message || 'Failed to get users', e.status || 500));
    }
  },
);

// ✅ MODIFIÉ: adminUsersPOST avec Bcrypt
const adminUsersPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const userData = params.createUserRequest || params.body || params;
      const { email, password, firstName, lastName, role: newUserRole } = userData;

      if (!email || !password || !firstName || !lastName || !newUserRole) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      if (db.getUserByEmail(email)) {
        return reject(Service.rejectResponse('Email already exists', 400));
      }

      // 🔐 HASHER LE MOT DE PASSE AVANT DE LE STOCKER
      const hashedPassword = await passwordUtils.hashPassword(password);

      const newUser = db.createUser({ 
        email, 
        password: hashedPassword,  // ✅ Utiliser le hash au lieu du texte clair
        firstName, 
        lastName, 
        role: newUserRole 
      });

      console.log('✅ User created:', newUser.id);

      const safeUser = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };

      resolve(Service.successResponse(safeUser, 201));
    } catch (e) {
      console.error('❌ Error in adminUsersPOST:', e.message);
      reject(Service.rejectResponse(e.message || 'Failed to create user', e.status || 500));
    }
  },
);

const adminUsersUserIdGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const user = db.getUserById(params.userId);
      if (!user) {
        return reject(Service.rejectResponse('User not found', 404));
      }

      const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      };

      resolve(Service.successResponse(safeUser));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get user', e.status || 500));
    }
  },
);

const adminUsersUserIdPUT = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const updates = params.updateUserRequest || params.body || params;
      
      // 🔐 SI LE MOT DE PASSE EST FOURNI, LE HASHER
      let updateData = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
      };

      if (updates.password) {
        updateData.password = await passwordUtils.hashPassword(updates.password);
      }

      const updatedUser = db.updateUser(params.userId, updateData);

      if (!updatedUser) {
        return reject(Service.rejectResponse('User not found', 404));
      }

      const safeUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      };

      resolve(Service.successResponse(safeUser));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to update user', e.status || 500));
    }
  },
);

const adminUsersUserIdDELETE = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const deleted = db.deleteUser(params.userId);
      if (!deleted) {
        return reject(Service.rejectResponse('User not found', 404));
      }

      console.log('✅ User deleted');
      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to delete user', e.status || 500));
    }
  },
);

// ==========================================
// COURSES
// ==========================================

const adminCoursesGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const courses = db.getAllCourses();
      console.log('✅ Found', courses.length, 'courses');
      resolve(Service.successResponse(courses));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get courses', e.status || 500));
    }
  },
);

const adminCoursesPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const courseData = params.createCourseRequest || params.body || params;
      const { code, title, description, credits } = courseData;

      if (!code || !title) {
        return reject(Service.rejectResponse('Code and title are required', 400));
      }

      const newCourse = db.createCourse({ code, title, description, credits });
      console.log('✅ Course created:', newCourse.id);
      resolve(Service.successResponse(newCourse, 201));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to create course', e.status || 500));
    }
  },
);

const adminCoursesCourseIdGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const course = db.getCourseById(params.courseId);
      if (!course) {
        return reject(Service.rejectResponse('Course not found', 404));
      }

      resolve(Service.successResponse(course));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get course', e.status || 500));
    }
  },
);

const adminCoursesCourseIdPUT = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const updates = params.updateCourseRequest || params.body || params;
      const updatedCourse = db.updateCourse(params.courseId, updates);

      if (!updatedCourse) {
        return reject(Service.rejectResponse('Course not found', 404));
      }

      resolve(Service.successResponse(updatedCourse));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to update course', e.status || 500));
    }
  },
);

const adminCoursesCourseIdDELETE = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const deleted = db.deleteCourse(params.courseId);
      if (!deleted) {
        return reject(Service.rejectResponse('Course not found', 404));
      }

      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to delete course', e.status || 500));
    }
  },
);

// ==========================================
// SESSIONS
// ==========================================

const adminSessionsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const sessions = db.getAllSessions();
      resolve(Service.successResponse(sessions));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get sessions', e.status || 500));
    }
  },
);

const adminSessionsPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const sessionData = params.createSessionRequest || params.body || params;
      const { courseId, semester, startDate, endDate } = sessionData;

      if (!courseId || !semester || !startDate || !endDate) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      const newSession = db.createSession({ courseId, semester, startDate, endDate });
      resolve(Service.successResponse(newSession, 201));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to create session', e.status || 500));
    }
  },
);

const adminSessionsSessionIdGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const session = db.getSessionById(params.sessionId);
      if (!session) {
        return reject(Service.rejectResponse('Session not found', 404));
      }

      resolve(Service.successResponse(session));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get session', e.status || 500));
    }
  },
);

const adminSessionsSessionIdPUT = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const updates = params.updateSessionRequest || params.body || params;
      const updatedSession = db.updateSession(params.sessionId, updates);

      if (!updatedSession) {
        return reject(Service.rejectResponse('Session not found', 404));
      }

      resolve(Service.successResponse(updatedSession));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to update session', e.status || 500));
    }
  },
);

const adminSessionsSessionIdDELETE = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const deleted = db.deleteSession(params.sessionId);
      if (!deleted) {
        return reject(Service.rejectResponse('Session not found', 404));
      }

      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to delete session', e.status || 500));
    }
  },
);

// ==========================================
// ENROLLMENTS
// ==========================================

const adminEnrollmentsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const enrollments = db.getAllEnrollments();
      resolve(Service.successResponse(enrollments));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get enrollments', e.status || 500));
    }
  },
);

const adminEnrollmentsPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const enrollmentData = params.createEnrollmentRequest || params.body || params;
      const { studentId, sessionId } = enrollmentData;

      if (!studentId || !sessionId) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      const newEnrollment = db.createEnrollment({ studentId, sessionId });
      resolve(Service.successResponse(newEnrollment, 201));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to create enrollment', e.status || 500));
    }
  },
);

const adminEnrollmentsEnrollmentIdDELETE = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const deleted = db.deleteEnrollment(params.enrollmentId);
      if (!deleted) {
        return reject(Service.rejectResponse('Enrollment not found', 404));
      }

      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to delete enrollment', e.status || 500));
    }
  },
);

// ==========================================
// COURSE ASSIGNMENTS
// ==========================================

const adminCourseAssignmentsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const assignments = db.getAllAssignments();
      resolve(Service.successResponse(assignments));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to get assignments', e.status || 500));
    }
  },
);

const adminCourseAssignmentsPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const assignmentData = params.createCourseAssignmentRequest || params.body || params;
      const { teacherId, sessionId } = assignmentData;

      if (!teacherId || !sessionId) {
        return reject(Service.rejectResponse('Missing required fields', 400));
      }

      const newAssignment = db.createAssignment({ teacherId, sessionId });
      resolve(Service.successResponse(newAssignment, 201));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to create assignment', e.status || 500));
    }
  },
);

const adminCourseAssignmentsAssignmentIdDELETE = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (params.role !== 'ADMIN') {
        return reject(Service.rejectResponse('Access denied: Admin role required', 403));
      }

      const deleted = db.deleteAssignment(params.assignmentId);
      if (!deleted) {
        return reject(Service.rejectResponse('Assignment not found', 404));
      }

      resolve(Service.successResponse({}, 204));
    } catch (e) {
      reject(Service.rejectResponse(e.message || 'Failed to delete assignment', e.status || 500));
    }
  },
);

module.exports = {
  adminUsersGET,
  adminUsersPOST,
  adminUsersUserIdGET,
  adminUsersUserIdPUT,
  adminUsersUserIdDELETE,
  adminCoursesGET,
  adminCoursesPOST,
  adminCoursesCourseIdGET,
  adminCoursesCourseIdPUT,
  adminCoursesCourseIdDELETE,
  adminSessionsGET,
  adminSessionsPOST,
  adminSessionsSessionIdGET,
  adminSessionsSessionIdPUT,
  adminSessionsSessionIdDELETE,
  adminEnrollmentsGET,
  adminEnrollmentsPOST,
  adminEnrollmentsEnrollmentIdDELETE,
  adminCourseAssignmentsGET,
  adminCourseAssignmentsPOST,
  adminCourseAssignmentsAssignmentIdDELETE,
};
