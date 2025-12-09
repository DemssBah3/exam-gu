import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import type { User, Course, Session, Enrollment, CourseAssignment } from '../../types';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserPlus, 
  UserCheck, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuth();

  // Récupérer les données en temps réel avec typage explicite
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: adminApi.getUsers,
    enabled: user?.role === 'ADMIN',
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: adminApi.getCourses,
    enabled: user?.role === 'ADMIN',
  });

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: adminApi.getSessions,
    enabled: user?.role === 'ADMIN',
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ['enrollments'],
    queryFn: adminApi.getEnrollments,
    enabled: user?.role === 'ADMIN',
  });

  const { data: assignments = [] } = useQuery<CourseAssignment[]>({
    queryKey: ['courseAssignments'],
    queryFn: adminApi.getCourseAssignments,
    enabled: user?.role === 'ADMIN',
  });

  // Calculer les statistiques
  const stats = [
    {
      name: 'Utilisateurs',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Total des comptes',
      breakdown: {
        admins: users.filter(u => u.role === 'ADMIN').length,
        teachers: users.filter(u => u.role === 'TEACHER').length,
        students: users.filter(u => u.role === 'STUDENT').length,
      }
    },
    {
      name: 'Cours',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-green-500',
      description: 'Cours disponibles',
    },
    {
      name: 'Sessions',
      value: sessions.length,
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'Sessions actives',
    },
    {
      name: 'Inscriptions',
      value: enrollments.length,
      icon: UserPlus,
      color: 'bg-orange-500',
      description: 'Étudiants inscrits',
    },
    {
      name: 'Assignations',
      value: assignments.length,
      icon: UserCheck,
      color: 'bg-pink-500',
      description: 'Enseignants assignés',
    },
  ];

  // Sessions actives (avec cours et enseignants)
  const activeSessions = sessions.slice(0, 5).map(session => {
    const course = courses.find(c => c.id === session.courseId);
    const assignment = assignments.find(a => a.sessionId === session.id);
    const teacher = assignment ? users.find(u => u.id === assignment.teacherId) : null;
    const enrollmentCount = enrollments.filter(e => e.sessionId === session.id).length;

    return {
      ...session,
      course,
      teacher,
      enrollmentCount,
    };
  });

  // Activités récentes (dernières inscriptions)
  const recentActivities = enrollments.slice(-10).reverse().map(enrollment => {
    const student = users.find(u => u.id === enrollment.studentId);
    const session = sessions.find(s => s.id === enrollment.sessionId);
    const course = session ? courses.find(c => c.id === session.courseId) : null;

    return {
      ...enrollment,
      student,
      session,
      course,
    };
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-CA');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-2">
          Tableau de bord administrateur
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            
            {/* Breakdown pour Utilisateurs */}
            {stat.breakdown && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-medium text-gray-900">{stat.breakdown.admins}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Enseignants</span>
                  <span className="font-medium text-gray-900">{stat.breakdown.teachers}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Étudiants</span>
                  <span className="font-medium text-gray-900">{stat.breakdown.students}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sessions Actives */}
      {activeSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sessions Actives
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enseignant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.course?.code || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.course?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {session.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.teacher ? (
                        <div>
                          <div className="font-medium">
                            {session.teacher.firstName} {session.teacher.lastName}
                          </div>
                          <div className="text-gray-500">{session.teacher.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserPlus className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {session.enrollmentCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.startDate).toLocaleDateString('fr-CA')} - {new Date(session.endDate).toLocaleDateString('fr-CA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activités Récentes */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activités Récentes
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Nouvelle inscription
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">
                        {activity.student?.firstName} {activity.student?.lastName}
                      </span>
                      {' '}inscrit à{' '}
                      <span className="font-medium">
                        {activity.course?.code} - {activity.session?.semester}
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatDate(activity.enrolledAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gérer les utilisateurs</h3>
            <p className="text-sm text-gray-600 mt-1">Créer, modifier ou supprimer des utilisateurs</p>
          </a>
          <a
            href="/admin/courses"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gérer les cours</h3>
            <p className="text-sm text-gray-600 mt-1">Créer et organiser les cours</p>
          </a>
          <a
            href="/admin/sessions"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
          >
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gérer les sessions</h3>
            <p className="text-sm text-gray-600 mt-1">Planifier les sessions de cours</p>
          </a>
        </div>
      </div>
    </div>
  );
}
