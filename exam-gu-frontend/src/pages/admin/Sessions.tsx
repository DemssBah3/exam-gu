import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import { SessionList } from '../../components/admin/SessionList';
import SessionForm from '../../components/admin/SessionForm';
import type { Session, CreateSessionRequest, UpdateSessionRequest } from '../../types';
import { Calendar } from 'lucide-react';

export function Sessions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: adminApi.getSessions,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: adminApi.getCourses,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsFormOpen(false);
      toast.success('Session créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionRequest }) =>
      adminApi.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setEditingSession(null);
      toast.success('Session modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleCreate = (data: CreateSessionRequest) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: UpdateSessionRequest) => {
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isLoading = loadingSessions || loadingCourses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Sessions</h1>
          <p className="text-gray-600 mt-1">Gérez les sessions de cours par semestre</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar size={20} />
          Créer une session
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des sessions...</p>
        </div>
      ) : (
        <SessionList
          sessions={sessions || []}
          courses={courses || []}
          onEdit={setEditingSession}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <SessionForm
          courses={courses || []}
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingSession && (
        <SessionForm
          session={editingSession}
          courses={courses || []}
          onSubmit={handleUpdate}
          onClose={() => setEditingSession(null)}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}