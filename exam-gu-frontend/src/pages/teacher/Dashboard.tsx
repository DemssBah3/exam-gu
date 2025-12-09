import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '../../api/teacher';
import { teacherExamApi } from '../../api/teacherExam';
import { 
  BookOpen, 
  Users, 
  FileText,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sessions = [] } = useQuery({
    queryKey: ['teacherMySessions'],
    queryFn: teacherApi.getMySessions,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['teacherExams'],
    queryFn: teacherExamApi.getMyExams,
  });

  const totalStudents = sessions.reduce(
    (sum: number, s: any) => sum + (s.enrollmentCount || 0),
    0
  );

  const publishedExams = exams.filter((e: any) => e.status === 'PUBLISHED').length;

  const stats = [
    {
      name: 'Cours Assignés',
      value: sessions.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/teacher/courses',
    },
    {
      name: 'Étudiants',
      value: totalStudents,
      icon: Users,
      color: 'bg-green-500',
      link: '/teacher/courses',
    },
    {
      name: 'Examens',
      value: exams.length,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/teacher/exams',
    },
    {
      name: 'Examens Publiés',
      value: publishedExams,
      icon: TrendingUp,
      color: 'bg-orange-500',
      link: '/teacher/exams',
    },
  ];

  const activeSessions = sessions.filter((s: any) => {
    const now = new Date();
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return now >= start && now <= end;
  });

  const upcomingExams = exams.filter((e: any) => {
    const now = new Date();
    const start = new Date(e.startTime);
    return start > now && e.status === 'PUBLISHED';
  }).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-1">
          Voici un aperçu de vos activités d'enseignement
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
        {/* Sessions Actives */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sessions Actives
          </h2>
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {activeSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => navigate('/teacher/courses')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {session.course?.code}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      En cours
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {session.course?.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {session.enrollmentCount} étudiant(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {session.semester}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucune session active actuellement
            </p>
          )}
        </div>

        {/* Examens à Venir */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Examens à Venir
          </h2>
          {upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {upcomingExams.map((exam: any) => (
                <div
                  key={exam.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {exam.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      Publié
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {exam.course?.code} - {exam.session?.semester}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(exam.startTime).toLocaleDateString('fr-CA')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {exam.questionCount} question(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun examen à venir
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
