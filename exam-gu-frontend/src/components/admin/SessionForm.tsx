import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Session, Course, CreateSessionRequest, UpdateSessionRequest } from '../../types';

// Schéma pour la création
const createSessionSchema = z.object({
  courseId: z.string().min(1, 'Veuillez sélectionner un cours'),
  semester: z.string().min(1, 'Le semestre est requis'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
});

// Schéma pour la modification
const updateSessionSchema = z.object({
  semester: z.string().min(1, 'Le semestre est requis').optional(),
  startDate: z.string().min(1, 'La date de début est requise').optional(),
  endDate: z.string().min(1, 'La date de fin est requise').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }
  return true;
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
});

type CreateSessionFormData = z.infer<typeof createSessionSchema>;
type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;

interface SessionFormProps {
  session?: Session;
  courses: Course[];
  onSubmit: (data: CreateSessionRequest | UpdateSessionRequest) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function SessionForm({ 
  session, 
  courses, 
  onSubmit, 
  onClose, 
  isSubmitting 
}: SessionFormProps) {
  const isEditing = !!session;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateSessionFormData | UpdateSessionFormData>({
    resolver: zodResolver(isEditing ? updateSessionSchema : createSessionSchema),
    defaultValues: session ? {
      semester: session.semester,
      startDate: session.startDate,
      endDate: session.endDate,
    } : undefined,
  });

  const selectedCourseId = watch('courseId' as any);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleFormSubmit = (data: CreateSessionFormData | UpdateSessionFormData) => {
    if (isEditing) {
      onSubmit(data as UpdateSessionRequest);
    } else {
      onSubmit(data as CreateSessionRequest);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Modifier la Session' : 'Nouvelle Session'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Cours (uniquement en création) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cours <span className="text-red-500">*</span>
              </label>
              {courses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Aucun cours disponible. Créez d'abord des cours dans la section Cours.
                </div>
              ) : (
                <select
                  {...register('courseId' as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.courseId && (
                <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>
              )}
            </div>
          )}

          {/* Afficher le cours en mode édition */}
          {isEditing && session && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cours
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {(() => {
                  const course = courses.find(c => c.id === session.courseId);
                  return course ? `${course.code} - ${course.title}` : 'Cours non trouvé';
                })()}
              </div>
              <p className="text-gray-500 text-xs mt-1">Le cours ne peut pas être modifié</p>
            </div>
          )}

          {/* Informations sur le cours sélectionné */}
          {!isEditing && selectedCourse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Informations sur le cours</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-blue-700">Code:</dt>
                  <dd className="font-medium text-blue-900">{selectedCourse.code}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-blue-700">Titre:</dt>
                  <dd className="font-medium text-blue-900">{selectedCourse.title}</dd>
                </div>
                {selectedCourse.credits && (
                  <div className="flex justify-between">
                    <dt className="text-blue-700">Crédits:</dt>
                    <dd className="font-medium text-blue-900">{selectedCourse.credits}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Semestre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semestre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('semester')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hiver 2025"
            />
            {errors.semester && (
              <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Format suggéré : Hiver 2025, Automne 2024, etc.
            </p>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin <span className="text-red-500">*</span>
            </label>
            <input
              {...register('endDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || (!isEditing && courses.length === 0)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
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
