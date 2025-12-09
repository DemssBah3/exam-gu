const TeacherGradingService = require('../services/TeacherGradingService');
const Controller = require('./Controller');

const teacherExamsExamIdAttemptsAttemptIdGradingGET = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherGradingService.teacherExamsExamIdAttemptsAttemptIdGradingGET);
};

const teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherGradingService.teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT);
};

const teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherGradingService.teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST);
};

module.exports = {
  teacherExamsExamIdAttemptsAttemptIdGradingGET,
  teacherExamsExamIdAttemptsAttemptIdGradingQuestionIdPUT,
  teacherExamsExamIdAttemptsAttemptIdGradingFinalizePOST,
};
