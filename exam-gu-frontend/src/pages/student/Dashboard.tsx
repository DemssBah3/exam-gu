import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../api/student';
import { studentExamApi } from '../../api/studentExam';
import { 
  BookOpen, 
  FileText,
  Clock,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: courses = [] } = useQuery({
    queryKey: ['studentMyCourses'],
    queryFn: studentApi.getMyCourses,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['studentExams'],
    queryFn: studentExamApi.getMyExams,
  });

  const availableExams = exams.filter((e: any) => e.isAvailable && e.canAttempt);
  const completedExams = exams.filter((e: any) => e.completedAttempts > 0);
  const upcomingExams = exams.filter((e: any) => e.isUpcoming);

  const stats = [
    {
      name: 'Mes Cours',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/student/courses',
    },
    {
      name: 'Examens Disponibles',
      value: availableExams.length,
      icon: FileText,
      color: 'bg-green-500',
      link: '/student/exams',
    },
    {
      name: 'Examens Complétés',
      value: completedExams.length,
      icon: Award,
      color: 'bg-purple-500',
      link: '/student/exams',
    },
    {
      name: 'À Venir',
      value: upcomingExams.length,
      icon: Clock,
      color: 'bg-orange-500',
      link: '/student/exams',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de vos cours et examens
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.link)}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.color} rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Examens Disponibles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Examens Disponibles
          </h2>
          {availableExams.length > 0 ? (
            <div className="space-y-3">
              {availableExams.slice(0, 5).map((exam: any) => (
                <div
                  key={exam.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/student/exams/${exam.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {exam.title}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      Disponible
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {exam.course?.code} - {exam.course?.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {exam.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {exam.questionCount} questions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun examen disponible actuellement
            </p>
          )}
        </div>

        {/* Cours Actifs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mes Cours Actifs
          </h2>
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.slice(0, 5).map((item: any) => {
                const now = new Date();
                const start = new Date(item.session.startDate);
                const end = new Date(item.session.endDate);
                const isActive = now >= start && now <= end;

                return (
                  <div
                    key={item.session.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => navigate('/student/courses')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.course?.code}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.course?.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {item.session.semester}
                      </span>
                      {item.teacher && (
                        <span>
                          {item.teacher.firstName} {item.teacher.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun cours actif
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
