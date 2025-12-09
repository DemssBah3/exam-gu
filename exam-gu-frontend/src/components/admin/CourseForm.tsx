import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../../types';

const courseSchema = z.object({
  code: z.string().min(1, 'Le code est requis').max(10, 'Maximum 10 caractères'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  credits: z.number().min(0, 'Les crédits doivent être positifs').optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CreateCourseRequest | UpdateCourseRequest) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function CourseForm({ course, onSubmit, onClose, isSubmitting }: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      code: course.code,
      title: course.title,
      description: course.description || '',
      credits: course.credits || 0,
    } : {
      credits: 3,
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {course ? 'Modifier le Cours' : 'Nouveau Cours'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code du cours <span className="text-red-500">*</span>
            </label>
            <input
              {...register('code')}
              disabled={!!course}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="INF111"
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}
            {course && (
              <p className="text-gray-500 text-xs mt-1">Le code ne peut pas être modifié</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Introduction à la programmation"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Description du cours..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crédits
            </label>
            <input
              {...register('credits', { valueAsNumber: true })}
              type="number"
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="3"
            />
            {errors.credits && (
              <p className="text-red-500 text-sm mt-1">{errors.credits.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : (course ? 'Modifier' : 'Créer')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}