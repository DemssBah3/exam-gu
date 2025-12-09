/**
 * AdminController
 * Contrôleur pour toutes les opérations d'administration
 */

const Controller = require('./Controller');
const service = require('../services/AdminService');

// ==========================================
// USERS
// ==========================================

const adminUsersGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminUsersGET);
};

const adminUsersPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminUsersPOST);
};

const adminUsersUserIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminUsersUserIdGET);
};

const adminUsersUserIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminUsersUserIdPUT);
};

const adminUsersUserIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminUsersUserIdDELETE);
};

// ==========================================
// COURSES
// ==========================================

const adminCoursesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCoursesGET);
};

const adminCoursesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCoursesPOST);
};

const adminCoursesCourseIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCoursesCourseIdGET);
};

const adminCoursesCourseIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCoursesCourseIdPUT);
};

const adminCoursesCourseIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCoursesCourseIdDELETE);
};

// ==========================================
// SESSIONS
// ==========================================

const adminSessionsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminSessionsGET);
};

const adminSessionsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminSessionsPOST);
};

const adminSessionsSessionIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminSessionsSessionIdGET);
};

const adminSessionsSessionIdPUT = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminSessionsSessionIdPUT);
};

const adminSessionsSessionIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminSessionsSessionIdDELETE);
};

// ==========================================
// ENROLLMENTS
// ==========================================

const adminEnrollmentsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminEnrollmentsGET);
};

const adminEnrollmentsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminEnrollmentsPOST);
};

const adminEnrollmentsEnrollmentIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminEnrollmentsEnrollmentIdDELETE);
};

// ==========================================
// COURSE ASSIGNMENTS
// ==========================================

const adminCourseAssignmentsGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCourseAssignmentsGET);
};

const adminCourseAssignmentsPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCourseAssignmentsPOST);
};

const adminCourseAssignmentsAssignmentIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.adminCourseAssignmentsAssignmentIdDELETE);
};

module.exports = {
  // Users
  adminUsersGET,
  adminUsersPOST,
  adminUsersUserIdGET,
  adminUsersUserIdPUT,
  adminUsersUserIdDELETE,
  
  // Courses
  adminCoursesGET,
  adminCoursesPOST,
  adminCoursesCourseIdGET,
  adminCoursesCourseIdPUT,
  adminCoursesCourseIdDELETE,
  
  // Sessions
  adminSessionsGET,
  adminSessionsPOST,
  adminSessionsSessionIdGET,
  adminSessionsSessionIdPUT,
  adminSessionsSessionIdDELETE,
  
  // Enrollments
  adminEnrollmentsGET,
  adminEnrollmentsPOST,
  adminEnrollmentsEnrollmentIdDELETE,
  
  // Course Assignments
  adminCourseAssignmentsGET,
  adminCourseAssignmentsPOST,
  adminCourseAssignmentsAssignmentIdDELETE,
};
