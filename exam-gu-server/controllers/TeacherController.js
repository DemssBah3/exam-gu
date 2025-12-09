const TeacherService = require('../services/TeacherService');
const Controller = require('./Controller');

/**
 * Get teacher's assigned sessions
 */
const teacherMySessionsGET = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherService.teacherMySessionsGET);
};

module.exports = {
  teacherMySessionsGET,
};
