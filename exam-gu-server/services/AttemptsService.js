/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Soumettre une réponse
* Soumettre ou mettre à jour la réponse à une question pendant une tentative
*
* examId String 
* attemptId String 
* questionId String 
* submitAnswerRequest SubmitAnswerRequest 
* returns Answer
* */
const examsExamIdAttemptsAttemptIdAnswersQuestionIdPOST = ({ examId, attemptId, questionId, submitAnswerRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        attemptId,
        questionId,
        submitAnswerRequest,
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
* Obtenir une tentative
* Retourne l'état courant d'une tentative
*
* examId String 
* attemptId String 
* returns AttemptDetail
* */
const examsExamIdAttemptsAttemptIdGET = ({ examId, attemptId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        attemptId,
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
* Sauvegarder manuellement
* Sauvegarder les réponses actuelles (sauvegarde manuelle)
*
* examId String 
* attemptId String 
* no response value expected for this operation
* */
const examsExamIdAttemptsAttemptIdSavePOST = ({ examId, attemptId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        attemptId,
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
* Soumettre l'examen
* Soumettre définitivement l'examen (fin de tentative)
*
* examId String 
* attemptId String 
* returns Result
* */
const examsExamIdAttemptsAttemptIdSubmitPOST = ({ examId, attemptId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        examId,
        attemptId,
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
* Démarrer une tentative
* Démarrer une nouvelle tentative d'examen pour un étudiant
*
* examId String 
* returns Attempt
* */
const examsExamIdAttemptsPOST = ({ examId }) => new Promise(
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

module.exports = {
  examsExamIdAttemptsAttemptIdAnswersQuestionIdPOST,
  examsExamIdAttemptsAttemptIdGET,
  examsExamIdAttemptsAttemptIdSavePOST,
  examsExamIdAttemptsAttemptIdSubmitPOST,
  examsExamIdAttemptsPOST,
};
