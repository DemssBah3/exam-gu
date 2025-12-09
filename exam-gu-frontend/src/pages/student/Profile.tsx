import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Calendar,
  LogIn,
  Clock,
  Globe,
  ArrowLeft,
  Award,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'loginHistory'>('profile');

  // Fetch login history
  const { data: loginLogs = [], isLoading, error } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: () => userApi.getLoginHistory(),
    retry: 1,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={18} />
                Profil
              </div>
            </button>
            <button
              onClick={() => setActiveTab('loginHistory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'loginHistory'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <LogIn size={18} />
                Historique de connexion
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-8">
                {/* Avatar */}
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="text-green-600" size={48} />
                  </div>
                </div>

                {/* User Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user?.firstName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user?.lastName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </div>
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Rôle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        Étudiant
                      </span>
                    </div>
                  </div>

                  {/* Date de création */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Compte créé le
                      </div>
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistiques supplémentaires */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Statistiques Académiques
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Examens passés</p>
                      <p className="text-2xl font-bold text-green-900 mt-2">-</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Score moyen</p>
                      <p className="text-2xl font-bold text-blue-900 mt-2">-</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 font-medium">Taux de réussite</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-2">-</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === 'loginHistory' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Chargement de l'historique...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-gray-600">
                  Impossible de charger l'historique de connexion
                </p>
              </div>
            ) : loginLogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <LogIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune connexion
                </h3>
                <p className="text-gray-600">
                  Votre historique de connexion apparaîtra ici
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            Date et heure
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <Globe size={16} />
                            Adresse IP
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Agent utilisateur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loginLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {log.ipAddress}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {log.userAgent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stats */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
                  <p className="text-sm text-gray-600">
                    {loginLogs.length} connexion{loginLogs.length > 1 ? 's' : ''} affichée{loginLogs.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
