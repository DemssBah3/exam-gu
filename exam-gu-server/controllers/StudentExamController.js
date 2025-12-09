const StudentExamService = require('../services/StudentExamService');
const Controller = require('./Controller');

const studentExamsGET = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsGET);
};

const studentExamsExamIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsExamIdGET);
};

const studentExamsExamIdStartPOST = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsExamIdStartPOST);
};

const studentExamsExamIdAttemptsAttemptIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsExamIdAttemptsAttemptIdGET);
};

const studentExamsExamIdAttemptsAttemptIdAnswersPOST = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsExamIdAttemptsAttemptIdAnswersPOST);
};

const studentExamsExamIdAttemptsAttemptIdSubmitPOST = async (request, response) => {
  await Controller.handleRequest(request, response, StudentExamService.studentExamsExamIdAttemptsAttemptIdSubmitPOST);
};

module.exports = {
  studentExamsGET,
  studentExamsExamIdGET,
  studentExamsExamIdStartPOST,
  studentExamsExamIdAttemptsAttemptIdGET,
  studentExamsExamIdAttemptsAttemptIdAnswersPOST,
  studentExamsExamIdAttemptsAttemptIdSubmitPOST,
};
