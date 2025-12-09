/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Lister les résultats
* Retourne tous les résultats (enseignant) ou ses résultats (étudiant)
*
* examId String 
* returns List
* */
const examsExamIdResultsGET = ({ examId }) => new Promise(
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
* Obtenir un résultat
* Retourne les détails d'un résultat (respecte la visibilité)
*
* examId String 
* resultId String 
* returns ResultDetail
* */
const examsExamIdResultsResultIdGET = ({ examId, resultId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        resultId,
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
* Corriger une question ouverte
* Assigner une note à une question ouverte (Enseignant seulement)
*
* examId String 
* resultId String 
* questionId String 
* examsExamIdResultsResultIdQuestionsQuestionIdGradePutRequest ExamsExamIdResultsResultIdQuestionsQuestionIdGradePutRequest 
* returns QuestionGrade
* */
const examsExamIdResultsResultIdQuestionsQuestionIdGradePUT = ({ examId, resultId, questionId, examsExamIdResultsResultIdQuestionsQuestionIdGradePutRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        resultId,
        questionId,
        examsExamIdResultsResultIdQuestionsQuestionIdGradePutRequest,
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
* Configurer la visibilité des résultats
* Configurer quelles infos sont visibles aux étudiants (Enseignant seulement)
*
* examId String 
* visibilityConfig VisibilityConfig 
* returns VisibilityConfig
* */
const examsExamIdVisibilityPUT = ({ examId, visibilityConfig }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        visibilityConfig,
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
  examsExamIdResultsGET,
  examsExamIdResultsResultIdGET,
  examsExamIdResultsResultIdQuestionsQuestionIdGradePUT,
  examsExamIdVisibilityPUT,
};
