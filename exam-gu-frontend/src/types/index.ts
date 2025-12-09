// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

// Types pour Admin - Users
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Types pour Admin - Courses
export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits?: number;
  createdAt: string;
}

export interface CreateCourseRequest {
  code: string;
  title: string;
  description?: string;
  credits?: number;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  credits?: number;
}

// Types pour Admin - Sessions
export interface Session {
  id: string;
  courseId: string;
  semester: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CreateSessionRequest {
  courseId: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSessionRequest {
  semester?: string;
  startDate?: string;
  endDate?: string;
}

// Types pour Admin - Enrollments
export interface Enrollment {
  id: string;
  studentId: string;
  sessionId: string;
  enrolledAt: string;
}

export interface CreateEnrollmentRequest {
  studentId: string;
  sessionId: string;
}

// Types pour Admin - Course Assignments
export interface CourseAssignment {
  id: string;
  teacherId: string;
  sessionId: string;
  assignedAt: string;
}

export interface CreateCourseAssignmentRequest {
  teacherId: string;
  sessionId: string;
}

// Types génériques
export interface ApiError {
  message: string;
  errors?: any[];
}