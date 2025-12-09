import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import EnrollmentList from '../../components/admin/EnrollmentList';
import EnrollmentForm from '../../components/admin/EnrollmentForm';
import type { CreateEnrollmentRequest } from '../../types';
import { UserPlus } from 'lucide-react';

export default function Enrollments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: adminApi.getEnrollments,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getUsers(),
  });

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: adminApi.getSessions,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: adminApi.getCourses,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createEnrollment,
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['studentMyCourses'] }); // ← Student voit le nouveau cours
      queryClient.invalidateQueries({ queryKey: ['teacherMySessions'] }); // ← Teacher voit le compteur mis à jour
      
      setIsFormOpen(false);
      toast.success('Étudiant inscrit avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteEnrollment,
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['studentMyCourses'] }); // ← Student ne voit plus le cours
      queryClient.invalidateQueries({ queryKey: ['teacherMySessions'] }); // ← Teacher voit le compteur mis à jour
      
      toast.success('Inscription supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleCreate = (data: CreateEnrollmentRequest) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cette inscription ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isLoading = loadingEnrollments || loadingUsers || loadingSessions || loadingCourses;

  // Filtrer les étudiants
  const students = users?.filter(u => u.role === 'STUDENT') || [];

  // Logs pour déboguer
  console.log('=== Enrollments Debug ===');
  console.log('All users:', users);
  console.log('Filtered students:', students);
  console.log('Students count:', students.length);
  console.log('========================');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Inscriptions</h1>
          <p className="text-gray-600 mt-1">
            Inscrire des étudiants aux sessions de cours
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={20} />
          Nouvelle Inscription
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Inscriptions</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {enrollments?.length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Étudiants Actifs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {students.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total users: {users?.length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Sessions Disponibles</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {sessions?.length || 0}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des inscriptions...</p>
        </div>
      ) : (
        <EnrollmentList
          enrollments={enrollments || []}
          users={users || []}
          sessions={sessions || []}
          courses={courses || []}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <EnrollmentForm
          students={students}
          sessions={sessions || []}
          courses={courses || []}
          existingEnrollments={enrollments || []}
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
