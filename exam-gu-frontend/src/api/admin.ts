import apiClient from './client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  Session,
  CreateSessionRequest,
  UpdateSessionRequest,
  Enrollment,
  CreateEnrollmentRequest,
  CourseAssignment,
  CreateCourseAssignmentRequest,
} from '../types';

export const adminApi = {
  // ==================== USERS ====================
    getUsers: async (role?: string): Promise<User[]> => {
    // CORRECTION : Ne pas envoyer le paramètre si role est undefined ou vide
    const params: any = {};
    if (role && role.trim() !== '') {
      params.role = role;
    }
    const response = await apiClient.get<User[]>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/admin/users', data);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  // ==================== COURSES ====================
  getCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/admin/courses');
    return response.data;
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await apiClient.get<Course>(`/admin/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    const response = await apiClient.post<Course>('/admin/courses', data);
    return response.data;
  },

  updateCourse: async (courseId: string, data: UpdateCourseRequest): Promise<Course> => {
    const response = await apiClient.put<Course>(`/admin/courses/${courseId}`, data);
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/admin/courses/${courseId}`);
  },

  // ==================== SESSIONS ====================
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<Session[]>('/admin/sessions');
    return response.data;
  },

  getSessionById: async (sessionId: string): Promise<Session> => {
    const response = await apiClient.get<Session>(`/admin/sessions/${sessionId}`);
    return response.data;
  },

  createSession: async (data: CreateSessionRequest): Promise<Session> => {
    const response = await apiClient.post<Session>('/admin/sessions', data);
    return response.data;
  },

  updateSession: async (sessionId: string, data: UpdateSessionRequest): Promise<Session> => {
    const response = await apiClient.put<Session>(`/admin/sessions/${sessionId}`, data);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/admin/sessions/${sessionId}`);
  },

  // ==================== ENROLLMENTS ====================
  getEnrollments: async (): Promise<Enrollment[]> => {
    const response = await apiClient.get<Enrollment[]>('/admin/enrollments');
    return response.data;
  },

  createEnrollment: async (data: CreateEnrollmentRequest): Promise<Enrollment> => {
    const response = await apiClient.post<Enrollment>('/admin/enrollments', data);
    return response.data;
  },

  deleteEnrollment: async (enrollmentId: string): Promise<void> => {
    await apiClient.delete(`/admin/enrollments/${enrollmentId}`);
  },

  // ==================== COURSE ASSIGNMENTS ====================
  getCourseAssignments: async (): Promise<CourseAssignment[]> => {
    const response = await apiClient.get<CourseAssignment[]>('/admin/course-assignments');
    return response.data;
  },

  createCourseAssignment: async (data: CreateCourseAssignmentRequest): Promise<CourseAssignment> => {
    const response = await apiClient.post<CourseAssignment>('/admin/course-assignments', data);
    return response.data;
  },

  deleteCourseAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/admin/course-assignments/${assignmentId}`);
  },
};
