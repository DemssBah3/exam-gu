import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import type { User, Session, Course, CreateCourseAssignmentRequest, CourseAssignment } from '../../types';

const assignmentSchema = z.object({
  teacherId: z.string().min(1, 'Veuillez sélectionner un enseignant'),
  sessionId: z.string().min(1, 'Veuillez sélectionner une session'),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface CourseAssignmentFormProps {
  teachers: User[];
  sessions: Session[];
  courses: Course[];
  existingAssignments: CourseAssignment[];
  onSubmit: (data: CreateCourseAssignmentRequest) => void;
  onClose: () => void;
  isSubmitting: boolean;
}
export default function CourseAssignmentForm({
  teachers,
  sessions,
  courses,
  existingAssignments,
  onSubmit,
  onClose,
  isSubmitting,
}: CourseAssignmentFormProps) {
  // AJOUTEZ CES LOGS
  console.log('=== CourseAssignmentForm Debug ===');
  console.log('Teachers:', teachers);
  console.log('Sessions:', sessions);
  console.log('Courses:', courses);
  console.log('===================================');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  const selectedTeacherId = watch('teacherId');
  const selectedSessionId = watch('sessionId');

  const courseMap = new Map(courses.map(c => [c.id, c]));

  const isDuplicate = existingAssignments.some(
    a => a.teacherId === selectedTeacherId && a.sessionId === selectedSessionId
  );

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const selectedCourse = selectedSession ? courseMap.get(selectedSession.courseId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Nouvelle Assignation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Enseignant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enseignant <span className="text-red-500">*</span>
            </label>
            
            {teachers.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Aucun enseignant disponible. Créez d'abord des enseignants dans la section Utilisateurs.
              </div>
            ) : (
              <select
                {...register('teacherId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                  </option>
                ))}
              </select>
            )}
            
            {errors.teacherId && (
              <p className="text-red-500 text-sm mt-1">{errors.teacherId.message}</p>
            )}
          </div>

          {/* Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session <span className="text-red-500">*</span>
            </label>
            
            {sessions.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Aucune session disponible. Créez d'abord des sessions dans la section Sessions.
              </div>
            ) : (
              <select
                {...register('sessionId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une session</option>
                {sessions.map(session => {
                  const course = courseMap.get(session.courseId);
                  return (
                    <option key={session.id} value={session.id}>
                      {course?.code || 'N/A'} - {course?.title || 'N/A'} ({session.semester})
                    </option>
                  );
                })}
              </select>
            )}
            
            {errors.sessionId && (
              <p className="text-red-500 text-sm mt-1">{errors.sessionId.message}</p>
            )}
          </div>

          {/* Détails de la session */}
          {selectedSession && selectedCourse && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Détails de la session</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-purple-700">Code:</dt>
                  <dd className="font-medium text-purple-900">{selectedCourse.code}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-purple-700">Crédits:</dt>
                  <dd className="font-medium text-purple-900">{selectedCourse.credits || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-purple-700">Période:</dt>
                  <dd className="font-medium text-purple-900">
                    {new Date(selectedSession.startDate).toLocaleDateString('fr-CA')} - {new Date(selectedSession.endDate).toLocaleDateString('fr-CA')}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {isDuplicate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-red-800">
                Cet enseignant est déjà assigné à cette session.
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isDuplicate || teachers.length === 0 || sessions.length === 0}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Assignation...' : 'Assigner'}
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
