const TeacherExamService = require('../services/TeacherExamService');
const Controller = require('./Controller');

const teacherExamsGET = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsGET);
};

const teacherExamsExamIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdGET);
};

const teacherExamsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsPOST);
};

const teacherExamsExamIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdPUT);
};

const teacherExamsExamIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdDELETE);
};

const teacherExamsExamIdPublishPOST = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdPublishPOST);
};

const teacherExamsExamIdQuestionsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdQuestionsPOST);
};

const teacherExamsExamIdQuestionsQuestionIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdQuestionsQuestionIdPUT);
};

const teacherExamsExamIdQuestionsQuestionIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdQuestionsQuestionIdDELETE);
};

const teacherExamsExamIdAttemptsGET = async (request, response) => {
  await Controller.handleRequest(request, response, TeacherExamService.teacherExamsExamIdAttemptsGET);
};

module.exports = {
  teacherExamsGET,
  teacherExamsExamIdGET,
  teacherExamsPOST,
  teacherExamsExamIdPUT,
  teacherExamsExamIdDELETE,
  teacherExamsExamIdPublishPOST,
  teacherExamsExamIdQuestionsPOST,
  teacherExamsExamIdQuestionsQuestionIdPUT,
  teacherExamsExamIdQuestionsQuestionIdDELETE,
  teacherExamsExamIdAttemptsGET,
};
