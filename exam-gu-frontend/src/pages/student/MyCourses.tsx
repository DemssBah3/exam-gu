import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../api/student';
import { 
  BookOpen, 
  Calendar,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

export function MyCourses() {
  const { user } = useAuth();

  // Récupérer MES cours
  const { data: myCourses = [], isLoading, refetch } = useQuery({
    queryKey: ['studentMyCourses'],
    queryFn: studentApi.getMyCourses,
  });

  console.log('My courses:', myCourses);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
          <p className="text-gray-600 mt-1">
            Cours auxquels vous êtes inscrit
          </p>
        </div>
        
        {/* Bouton de rafraîchissement */}
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cours Inscrits</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {myCourses.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {myCourses.filter((c: any) => {
                  const now = new Date();
                  const start = new Date(c.session.startDate);
                  const end = new Date(c.session.endDate);
                  return now >= start && now <= end;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Examens</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Cours */}
      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myCourses.map((item: any) => {
            const now = new Date();
            const start = new Date(item.session.startDate);
            const end = new Date(item.session.endDate);
            const isActive = now >= start && now <= end;
            const isUpcoming = now < start;

            return (
              <div key={item.session.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {item.course?.code}
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
                    {item.course?.title}
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Session</span>
                    <span className="font-medium">{item.session.semester}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Enseignant</span>
                    <span className="font-medium">
                      {item.teacher ? (
                        `${item.teacher.firstName} ${item.teacher.lastName}`
                      ) : (
                        <span className="text-gray-400">Non assigné</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Période</span>
                    <span className="font-medium text-xs">
                      {new Date(item.session.startDate).toLocaleDateString('fr-CA')} - {new Date(item.session.endDate).toLocaleDateString('fr-CA')}
                    </span>
                  </div>
                  {item.course?.credits && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Crédits</span>
                      <span className="font-medium">{item.course.credits}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0">
                  <button
                    disabled
                    className="w-full flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={16} />
                      Voir les Examens
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
            Aucun cours inscrit
          </h3>
          <p className="text-gray-600">
            Vous n'êtes pas encore inscrit à des cours. Contactez l'administrateur.
          </p>
        </div>
      )}
    </div>
  );
}
