import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/Login';

// Layouts
import { AdminLayout } from './components/layout/AdminLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { StudentLayout } from './components/layout/StudentLayout';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { Courses } from './pages/admin/Courses';
import { Sessions } from './pages/admin/Sessions';
import Enrollments from './pages/admin/Enrollments';
import CourseAssignments from './pages/admin/CourseAssignments';
import { Profile as AdminProfile } from './pages/admin/Profile';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { MyCourses as TeacherMyCourses } from './pages/teacher/MyCourses';
import { Exams } from './pages/teacher/Exams';
import { CreateExam } from './pages/teacher/CreateExam';
import { ExamDetails } from './pages/teacher/ExamDetails';
import { GradeAttempts } from './pages/teacher/GradeAttempts';
import { GradeAttempt } from './pages/teacher/GradeAttempt';
import { Profile as TeacherProfile } from './pages/teacher/Profile';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { MyCourses as StudentMyCourses } from './pages/student/MyCourses';
import { Exams as StudentExams } from './pages/student/Exams';
import { ExamStart } from './pages/student/ExamStart';
import { TakeExam } from './pages/student/TakeExam';
import { ExamResults } from './pages/student/ExamResults';
import { Profile as StudentProfile } from './pages/student/Profile';

// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="courses" element={<Courses />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="enrollments" element={<Enrollments />} />
              <Route path="assignments" element={<CourseAssignments />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherMyCourses />} />
              <Route path="exams" element={<Exams />} />
              <Route path="exams/create" element={<CreateExam />} />
              <Route path="exams/:examId" element={<ExamDetails />} />
              <Route path="exams/:examId/grading" element={<GradeAttempts />} />
              <Route path="exams/:examId/attempts/:attemptId/grade" element={<GradeAttempt />} />
              <Route path="/teacher/profile" element={<TeacherProfile />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentMyCourses />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="exams/:examId" element={<ExamStart />} />
              <Route path="exams/:examId/attempt/:attemptId" element={<TakeExam />} />
              <Route path="exams/:examId/results" element={<ExamResults />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900">404</h1>
                    <p className="text-gray-600 mt-4">Page non trouvée</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;