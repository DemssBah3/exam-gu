/**
 * Mock data pour tous les tests
 */

const mockUser = {
  id: 'user-123',
  email: 'test@uqac.ca',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STUDENT',
  password: 'hashedPassword123',
};

const mockTeacher = {
  id: 'teacher-123',
  email: 'prof@uqac.ca',
  firstName: 'Jane',
  lastName: 'Professor',
  role: 'TEACHER',
  password: 'hashedPassword456',
};

const mockCourse = {
  id: 'course-123',
  code: 'MAT101',
  title: 'Mathematics 101',
  description: 'Basic Mathematics Course',
  teacherId: mockTeacher.id,
};

const mockExam = {
  id: 'exam-123',
  title: 'Midterm Exam',
  description: 'First midterm examination',
  duration: 60, // minutes
  totalPoints: 100,
  status: 'PUBLISHED',
  courseId: mockCourse.id,
  teacherId: mockTeacher.id,
  maxAttempts: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMCQQuestion = {
  id: 'q-1',
  examId: mockExam.id,
  text: 'What is 2 + 2?',
  type: 'MCQ',
  points: 5,
  options: [
    { id: 'opt-1', text: 'Option A: 3', isCorrect: false },
    { id: 'opt-2', text: 'Option B: 4', isCorrect: true },
    { id: 'opt-3', text: 'Option C: 5', isCorrect: false },
    { id: 'opt-4', text: 'Option D: 6', isCorrect: false },
  ],
  createdAt: new Date().toISOString(),
};

const mockTrueFalseQuestion = {
  id: 'q-2',
  examId: mockExam.id,
  text: 'Paris is the capital of France',
  type: 'TRUE_FALSE',
  points: 3,
  correctAnswer: true,
  createdAt: new Date().toISOString(),
};

const mockOpenEndedQuestion = {
  id: 'q-3',
  examId: mockExam.id,
  text: 'Explain the theory of relativity in 100 words',
  type: 'OPEN_ENDED',
  points: 15,
  createdAt: new Date().toISOString(),
};

const mockAttempt = {
  id: 'attempt-123',
  studentId: mockUser.id,
  examId: mockExam.id,
  status: 'IN_PROGRESS',
  startTime: new Date().toISOString(),
  endTime: null,
  score: null,
  answers: [],
};

const mockSubmittedAttempt = {
  id: 'attempt-456',
  studentId: mockUser.id,
  examId: mockExam.id,
  status: 'SUBMITTED',
  startTime: new Date(Date.now() - 3600000).toISOString(), // 1 heure avant
  endTime: new Date().toISOString(),
  score: 65,
  answers: [
    {
      id: 'ans-1',
      questionId: mockMCQQuestion.id,
      attemptId: 'attempt-456',
      selectedOption: 'opt-2',
      textAnswer: null,
      booleanAnswer: null,
    },
    {
      id: 'ans-2',
      questionId: mockTrueFalseQuestion.id,
      attemptId: 'attempt-456',
      selectedOption: null,
      textAnswer: null,
      booleanAnswer: true,
    },
    {
      id: 'ans-3',
      questionId: mockOpenEndedQuestion.id,
      attemptId: 'attempt-456',
      selectedOption: null,
      textAnswer: 'Einstein proposed that energy and mass are interchangeable...',
      booleanAnswer: null,
    },
  ],
};

const mockAnswer = {
  id: 'ans-1',
  questionId: mockMCQQuestion.id,
  attemptId: mockAttempt.id,
  selectedOption: 'opt-2',
  textAnswer: null,
  booleanAnswer: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockGrade = {
  id: 'grade-123',
  answerId: mockAnswer.id,
  points: 5,
  feedback: 'Correct answer!',
  gradedBy: mockTeacher.id,
  gradedAt: new Date().toISOString(),
};

module.exports = {
  mockUser,
  mockTeacher,
  mockCourse,
  mockExam,
  mockMCQQuestion,
  mockTrueFalseQuestion,
  mockOpenEndedQuestion,
  mockAttempt,
  mockSubmittedAttempt,
  mockAnswer,
  mockGrade,
};
