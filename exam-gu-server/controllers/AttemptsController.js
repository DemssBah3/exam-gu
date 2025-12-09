
const Controller = require('./Controller');
const service = require('../services/AttemptsService');
const examsExamIdAttemptsAttemptIdAnswersQuestionIdPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdAttemptsAttemptIdAnswersQuestionIdPOST);
};

const examsExamIdAttemptsAttemptIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdAttemptsAttemptIdGET);
};

const examsExamIdAttemptsAttemptIdSavePOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdAttemptsAttemptIdSavePOST);
};

const examsExamIdAttemptsAttemptIdSubmitPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdAttemptsAttemptIdSubmitPOST);
};

const examsExamIdAttemptsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdAttemptsPOST);
};


module.exports = {
  examsExamIdAttemptsAttemptIdAnswersQuestionIdPOST,
  examsExamIdAttemptsAttemptIdGET,
  examsExamIdAttemptsAttemptIdSavePOST,
  examsExamIdAttemptsAttemptIdSubmitPOST,
  examsExamIdAttemptsPOST,
};
