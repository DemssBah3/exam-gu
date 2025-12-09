/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

/**
 * Get courses the student is enrolled in
 */
const studentMyCoursesGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      // Récupérer les inscriptions de l'étudiant
      const enrollments = db.getAllEnrollments().filter(
        e => e.studentId === params.userId
      );

      if (enrollments.length === 0) {
        console.log('✅ No courses enrolled for student');
        return resolve(Service.successResponse([]));
      }

      // Récupérer les sessions correspondantes
      const sessionIds = enrollments.map(e => e.sessionId);
      const sessions = db.getAllSessions().filter(
        s => sessionIds.includes(s.id)
      );

      // Enrichir avec les infos complètes
      const enrichedCourses = sessions.map(session => {
        const course = db.getCourseById(session.courseId);
        
        // Trouver l'enseignant assigné
        const assignment = db.getAllAssignments().find(
          a => a.sessionId === session.id
        );
        
        let teacher = null;
        if (assignment) {
          const teacherUser = db.getUserById(assignment.teacherId);
          if (teacherUser) {
            teacher = {
              id: teacherUser.id,
              email: teacherUser.email,
              firstName: teacherUser.firstName,
              lastName: teacherUser.lastName,
              role: teacherUser.role,
            };
          }
        }

        return {
          session,
          course,
          teacher,
        };
      });

      console.log('✅ Found', enrichedCourses.length, 'courses for student');
      resolve(Service.successResponse(enrichedCourses));
    } catch (e) {
      console.error('❌ Error in studentMyCoursesGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch courses',
        e.status || 500
      ));
    }
  },
);

module.exports = {
  studentMyCoursesGET,
};
