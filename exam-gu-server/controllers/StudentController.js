const StudentService = require('../services/StudentService');
const Controller = require('./Controller');

/**
 * Get student's enrolled courses
 */
const studentMyCoursesGET = async (request, response) => {
  await Controller.handleRequest(request, response, StudentService.studentMyCoursesGET);
};

module.exports = {
  studentMyCoursesGET,
};
