import { Users } from 'lucide-react'; // ← Ajoutez cette ligne
import type { User } from '../../types';
import { Pencil, Trash2, Mail, Calendar } from 'lucide-react';


interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

export const UserList = ({ users, onEdit, onDelete, isLoading }: UserListProps) => {
  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      TEACHER: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Nom complet</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Date de création</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="font-medium">
                {user.firstName} {user.lastName}
              </td>
              <td>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
              </td>
              <td>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`)) {
                        onDelete(user.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
