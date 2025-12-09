import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import { UserList } from '../../components/admin/UserList';
import {UserForm }from '../../components/admin/UserForm';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { UserPlus } from 'lucide-react';

export function Users() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', filterRole],
    queryFn: () => adminApi.getUsers(filterRole || undefined),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsFormOpen(false);
      toast.success('Utilisateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      toast.success('Utilisateur modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleCreate = (data: CreateUserRequest) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: UpdateUserRequest) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gérez les comptes administrateurs, enseignants et étudiants
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          Créer un utilisateur
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrer par rôle :</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Enseignant</option>
            <option value="STUDENT">Étudiant</option>
          </select>
          {filterRole && (
            <button
              onClick={() => setFilterRole('')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <UserList
          users={users || []}
          onEdit={setEditingUser}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <UserForm
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdate}
          onClose={() => setEditingUser(null)}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}
