/**
 * Mock data pour tous les tests Frontend
 */

export const mockUser = {
  id: 'user-123',
  email: 'student@uqac.ca',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STUDENT',
};

export const mockTeacher = {
  id: 'teacher-123',
  email: 'prof@uqac.ca',
  firstName: 'Jane',
  lastName: 'Professor',
  role: 'TEACHER',
};

export const mockCourse = {
  id: 'course-123',
  code: 'MAT101',
  title: 'Mathematics 101',
};

export const mockExam = {
  id: 'exam-123',
  title: 'Midterm Exam',
  description: 'First midterm examination',
  duration: 60,
  totalPoints: 100,
  status: 'PUBLISHED',
  courseId: 'course-123',
  course: {
    code: 'MAT101',
    title: 'Mathematics 101',
  },
  maxAttempts: 3,
  questionCount: 3,
  attemptCount: 1,
};

export const mockMCQQuestion = {
  id: 'q-1',
  text: 'What is 2 + 2?',
  type: 'MCQ',
  points: 5,
  options: [
    { id: 'opt-1', text: 'Option A: 3' },
    { id: 'opt-2', text: 'Option B: 4' },
    { id: 'opt-3', text: 'Option C: 5' },
    { id: 'opt-4', text: 'Option D: 6' },
  ],
};

export const mockTrueFalseQuestion = {
  id: 'q-2',
  text: 'Paris is the capital of France',
  type: 'TRUE_FALSE',
  points: 3,
};

export const mockOpenEndedQuestion = {
  id: 'q-3',
  text: 'Explain the theory of relativity in 100 words',
  type: 'OPEN_ENDED',
  points: 15,
};

export const mockAttempt = {
  id: 'attempt-123',
  studentId: 'user-123',
  examId: 'exam-123',
  status: 'IN_PROGRESS',
  startTime: new Date().toISOString(),
  endTime: null,
  score: null,
  exam: mockExam,
  questions: [mockMCQQuestion, mockTrueFalseQuestion, mockOpenEndedQuestion],
};

export const mockSubmittedAttempt = {
  id: 'attempt-456',
  studentId: 'user-123',
  examId: 'exam-123',
  status: 'SUBMITTED',
  startTime: new Date(Date.now() - 3600000).toISOString(),
  endTime: new Date().toISOString(),
  score: 65,
  exam: mockExam,
  questions: [mockMCQQuestion, mockTrueFalseQuestion, mockOpenEndedQuestion],
};

export const mockResults = {
  score: 65,
  maxScore: 100,
  percentage: 65,
  isAvailable: true,
  questions: [
    {
      id: 'q-1',
      text: 'What is 2 + 2?',
      studentAnswer: 'Option B: 4',
      correctAnswer: 'Option B: 4',
      isCorrect: true,
      points: 5,
    },
    {
      id: 'q-2',
      text: 'Paris is the capital of France',
      studentAnswer: 'true',
      correctAnswer: 'true',
      isCorrect: true,
      points: 3,
    },
    {
      id: 'q-3',
      text: 'Explain the theory of relativity in 100 words',
      studentAnswer: 'Einstein proposed that energy and mass are interchangeable...',
      isCorrect: true,
      points: 12,
      feedback: 'Good explanation!',
    },
  ],
};

export const mockStudentAttempt = {
  id: 'attempt-1',
  studentId: 'student-1',
  studentName: 'John Doe',
  studentEmail: 'john@uqac.ca',
  status: 'SUBMITTED',
  startTime: new Date(Date.now() - 3600000).toISOString(),
  endTime: new Date().toISOString(),
  answeredCount: 2,
  totalQuestions: 3,
  score: null,
  isGraded: false,
};

export const mockGradingAttempts = [
  mockStudentAttempt,
  {
    id: 'attempt-2',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    studentEmail: 'jane@uqac.ca',
    status: 'SUBMITTED',
    answeredCount: 3,
    totalQuestions: 3,
    score: null,
    isGraded: false,
  },
  {
    id: 'attempt-3',
    studentId: 'student-3',
    studentName: 'Bob Johnson',
    studentEmail: 'bob@uqac.ca',
    status: 'SUBMITTED',
    answeredCount: 3,
    totalQuestions: 3,
    score: 78,
    isGraded: true,
  },
];

export const mockGradingQuestion = {
  id: 'q-3',
  questionId: 'q-3',
  text: 'Explain the theory of relativity in 100 words',
  type: 'OPEN_ENDED',
  points: 15,
  studentAnswer: 'Einstein proposed that energy and mass are interchangeable. According to his theory...',
};

export const mockExamList = [
  mockExam,
  {
    id: 'exam-456',
    title: 'Final Exam',
    description: 'Final examination',
    duration: 120,
    totalPoints: 100,
    status: 'PUBLISHED',
    course: {
      code: 'MAT102',
      title: 'Advanced Mathematics',
    },
    maxAttempts: 2,
    questionCount: 5,
    attemptCount: 0,
  },
  {
    id: 'exam-789',
    title: 'Quiz 1',
    description: 'Quick quiz',
    duration: 20,
    totalPoints: 50,
    status: 'PUBLISHED',
    course: {
      code: 'PHY101',
      title: 'Physics 101',
    },
    maxAttempts: 1,
    questionCount: 10,
    attemptCount: 1,
  },
];

export const mockTeacherExamList = [
  {
    id: 'exam-123',
    title: 'Midterm Exam',
    status: 'PUBLISHED',
    courseId: 'course-123',
    course: mockCourse,
    totalAttempts: 25,
    averageScore: 72,
    questionCount: 10,
  },
  {
    id: 'exam-456',
    title: 'Final Exam',
    status: 'DRAFT',
    courseId: 'course-123',
    course: mockCourse,
    totalAttempts: 0,
    averageScore: 0,
    questionCount: 0,
  },
];
