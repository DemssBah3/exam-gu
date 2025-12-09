/**
 * The ExamsController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/ExamsService');
const examsExamIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdDELETE);
};

const examsExamIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdGET);
};

const examsExamIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdPUT);
};

const examsExamIdStatusPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsExamIdStatusPUT);
};

const examsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsGET);
};

const examsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.examsPOST);
};


module.exports = {
  examsExamIdDELETE,
  examsExamIdGET,
  examsExamIdPUT,
  examsExamIdStatusPUT,
  examsGET,
  examsPOST,
};
