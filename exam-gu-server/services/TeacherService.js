/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');

/**
 * Get sessions assigned to the teacher
 */
const teacherMySessionsGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      if (!params.userId) {
        return reject(Service.rejectResponse('User ID not found', 401));
      }

      // Récupérer les assignations du teacher
      const assignments = db.getAllAssignments().filter(
        a => a.teacherId === params.userId
      );

      if (assignments.length === 0) {
        console.log('✅ No sessions assigned to teacher');
        return resolve(Service.successResponse([]));
      }

      // Récupérer les sessions correspondantes
      const sessionIds = assignments.map(a => a.sessionId);
      const sessions = db.getAllSessions().filter(
        s => sessionIds.includes(s.id)
      );

      // Enrichir avec les infos des cours et compter les étudiants
      const enrichedSessions = sessions.map(session => {
        const course = db.getCourseById(session.courseId);
        
        // Compter les étudiants inscrits
        const enrollmentCount = db.getAllEnrollments().filter(
          e => e.sessionId === session.id
        ).length;

        return {
          ...session,
          course,
          enrollmentCount,
        };
      });

      console.log('✅ Found', enrichedSessions.length, 'sessions for teacher');
      resolve(Service.successResponse(enrichedSessions));
    } catch (e) {
      console.error('❌ Error in teacherMySessionsGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to fetch sessions',
        e.status || 500
      ));
    }
  },
);

module.exports = {
  teacherMySessionsGET,
};
