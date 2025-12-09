import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '../../api/teacher';
import { 
  BookOpen, 
  Users, 
  Calendar,
  FileText,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ['teacherMySessions'],
    queryFn: teacherApi.getMySessions,
  });

  console.log('My sessions:', mySessions);

  const stats = [
    {
      name: 'Cours Assignés',
      value: mySessions.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Étudiants',
      value: mySessions.reduce((sum: number, s: any) => sum + (s.enrollmentCount || 0), 0),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Sessions Actives',
      value: mySessions.filter((s: any) => {
        const now = new Date();
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        return now >= start && now <= end;
      }).length,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      name: 'Examens',
      value: 0,
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
          <p className="text-gray-600 mt-1">
            Sessions de cours qui vous sont assignées
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
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

      {/* Liste des Cours */}
      {mySessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mySessions.map((session: any) => {
            const now = new Date();
            const start = new Date(session.startDate);
            const end = new Date(session.endDate);
            const isActive = now >= start && now <= end;
            const isUpcoming = now < start;

            return (
              <div key={session.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {session.course?.code}
                    </span>
                    {isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
                        <CheckCircle size={12} />
                        En cours
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center gap-1">
                        <Clock size={12} />
                        À venir
                      </span>
                    )}
                    {!isActive && !isUpcoming && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                        Terminé
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {session.course?.title}
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Session</span>
                    <span className="font-medium">{session.semester}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Étudiants</span>
                    <span className="font-medium">{session.enrollmentCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Période</span>
                    <span className="font-medium text-xs">
                      {new Date(session.startDate).toLocaleDateString('fr-CA')} - {new Date(session.endDate).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate('/teacher/exams/create', { state: { sessionId: session.id } })}
                    className="w-full flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={16} />
                      Créer un Examen
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun cours assigné
          </h3>
          <p className="text-gray-600">
            Vous n'avez pas encore de cours assigné. Contactez l'administrateur.
          </p>
        </div>
      )}
    </div>
  );
}
