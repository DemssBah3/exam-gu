/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Lister les questions
* Retourne les questions d'un examen
*
* examId String 
* returns List
* */
const examsExamIdQuestionsGET = ({ examId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Ajouter une question
* Ajouter une question à un examen en brouillon (Enseignant seulement)
*
* examId String 
* createQuestionRequest CreateQuestionRequest 
* returns Question
* */
const examsExamIdQuestionsPOST = ({ examId, createQuestionRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        createQuestionRequest,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Supprimer une question
* Supprimer une question d'un examen en brouillon (Enseignant seulement)
*
* examId String 
* questionId String 
* no response value expected for this operation
* */
const examsExamIdQuestionsQuestionIdDELETE = ({ examId, questionId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        questionId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Obtenir une question
*
* examId String 
* questionId String 
* returns Question
* */
const examsExamIdQuestionsQuestionIdGET = ({ examId, questionId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        questionId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Modifier une question
* Modifier une question d'un examen en brouillon (Enseignant seulement)
*
* examId String 
* questionId String 
* updateQuestionRequest UpdateQuestionRequest 
* returns Question
* */
const examsExamIdQuestionsQuestionIdPUT = ({ examId, questionId, updateQuestionRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        questionId,
        updateQuestionRequest,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  examsExamIdQuestionsGET,
  examsExamIdQuestionsPOST,
  examsExamIdQuestionsQuestionIdDELETE,
  examsExamIdQuestionsQuestionIdGET,
  examsExamIdQuestionsQuestionIdPUT,
};
