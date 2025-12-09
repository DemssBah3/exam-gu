import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { Mail, User as UserIcon, Shield, Calendar, Clock } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  // Récupérer l'historique des connexions
  const { data: loginHistory, isLoading } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: authApi.getLoginHistory,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      {/* User Info Card */}
      <div className="card mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.firstName} {user?.lastName}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{user?.email}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Membre depuis le {user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Historique des connexions</span>
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : loginHistory && loginHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Adresse IP</th>
                  <th>Navigateur</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td className="font-mono text-sm">{log.ipAddress || '-'}</td>
                    <td className="text-gray-600">{log.userAgent || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Aucune connexion enregistrée</p>
        )}
      </div>
    </div>
  );
};
