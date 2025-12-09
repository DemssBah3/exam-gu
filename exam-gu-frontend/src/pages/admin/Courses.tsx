import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin';
import { CourseList } from '../../components/admin/CourseList';
import CourseForm from '../../components/admin/CourseForm';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../../types';
import { BookOpen } from 'lucide-react';

export function Courses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: adminApi.getCourses,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsFormOpen(false);
      toast.success('Cours créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseRequest }) =>
      adminApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      toast.success('Cours modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Cours supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleCreate = (data: CreateCourseRequest) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: UpdateCourseRequest) => {
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
          <p className="text-gray-600 mt-1">Gérez les cours disponibles à l'université</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BookOpen size={20} />
          Créer un cours
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des cours...</p>
        </div>
      ) : (
        <CourseList
          courses={courses || []}
          onEdit={setEditingCourse}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <CourseForm
          onSubmit={handleCreate}
          onClose={() => setIsFormOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {editingCourse && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleUpdate}
          onClose={() => setEditingCourse(null)}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}