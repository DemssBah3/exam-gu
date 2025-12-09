/**
 * The QuestionsController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/QuestionsService');
const examsExamIdQuestionsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdQuestionsGET);
};

const examsExamIdQuestionsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdQuestionsPOST);
};

const examsExamIdQuestionsQuestionIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdQuestionsQuestionIdDELETE);
};

const examsExamIdQuestionsQuestionIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdQuestionsQuestionIdGET);
};

const examsExamIdQuestionsQuestionIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdQuestionsQuestionIdPUT);
};


module.exports = {
  examsExamIdQuestionsGET,
  examsExamIdQuestionsPOST,
  examsExamIdQuestionsQuestionIdDELETE,
  examsExamIdQuestionsQuestionIdGET,
  examsExamIdQuestionsQuestionIdPUT,
};
