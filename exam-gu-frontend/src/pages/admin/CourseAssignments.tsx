import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import CourseAssignmentList from '../../components/admin/CourseAssignmentList';
import CourseAssignmentForm from '../../components/admin/CourseAssignmentForm';
import type { CreateCourseAssignmentRequest } from '../../types';
import { UserCheck } from 'lucide-react';

export default function CourseAssignments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['courseAssignments'],
    queryFn: adminApi.getCourseAssignments,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: adminApi.getUsers,
  });

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: adminApi.getSessions,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: adminApi.getCourses,
  });

  // ✅ UNE SEULE mutation pour créer
  const createMutation = useMutation({
    mutationFn: adminApi.createCourseAssignment,
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacherMySessions'] }); // ← Pour rafraîchir la page teacher
      
      setIsFormOpen(false);
      toast.success('Enseignant assigné avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCourseAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacherMySessions'] }); // ← Pour rafraîchir la page teacher
      toast.success('Assignation supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleCreate = (data: CreateCourseAssignmentRequest) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cette assignation ?')) {
      deleteMutation.mutate(id);
    }
  };

  const isLoading = loadingAssignments || loadingUsers || loadingSessions || loadingCourses;

  // Filtrer correctement les enseignants
  const teachers = users?.filter(u => u.role === 'TEACHER') || [];

  // Log pour déboguer
  console.log('=== CourseAssignments Debug ===');
  console.log('All users:', users);
  console.log('Filtered teachers:', teachers);
  console.log('Teachers count:', teachers.length);
  console.log('==============================');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignations d'Enseignants</h1>
          <p className="text-gray-600 mt-1">
            Assigner des enseignants aux sessions de cours
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserCheck size={20} />
          Nouvelle Assignation
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Assignations</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {assignments?.length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Enseignants Actifs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {teachers.length}
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
          <p className="text-gray-600 mt-4">Chargement des assignations...</p>
        </div>
      ) : (
        <CourseAssignmentList
          assignments={assignments || []}
          users={users || []}
          sessions={sessions || []}
          courses={courses || []}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <CourseAssignmentForm
          teachers={teachers}
          sessions={sessions || []}
          courses={courses || []}
          existingAssignments={assignments || []}
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}
