import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import type { User, Session, Course, CreateEnrollmentRequest, Enrollment } from '../../types';

const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'Veuillez sélectionner un étudiant'),
  sessionId: z.string().min(1, 'Veuillez sélectionner une session'),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  students: User[];
  sessions: Session[];
  courses: Course[];
  existingEnrollments: Enrollment[];
  onSubmit: (data: CreateEnrollmentRequest) => void;
  onClose: () => void;
  isSubmitting: boolean;
}
export default function EnrollmentForm({
  students,
  sessions,
  courses,
  existingEnrollments,
  onSubmit,
  onClose,
  isSubmitting,
}: EnrollmentFormProps) {
  // AJOUTEZ CES LOGS POUR DÉBOGUER
  console.log('=== EnrollmentForm Debug ===');
  console.log('Students:', students);
  console.log('Sessions:', sessions);
  console.log('Courses:', courses);
  console.log('===========================');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const selectedStudentId = watch('studentId');
  const selectedSessionId = watch('sessionId');

  const courseMap = new Map(courses.map(c => [c.id, c]));

  const isDuplicate = existingEnrollments.some(
    e => e.studentId === selectedStudentId && e.sessionId === selectedSessionId
  );

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const selectedCourse = selectedSession ? courseMap.get(selectedSession.courseId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Nouvelle Inscription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Étudiant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Étudiant <span className="text-red-500">*</span>
            </label>
            
            {/* AJOUTEZ UN MESSAGE SI PAS D'ÉTUDIANTS */}
            {students.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Aucun étudiant disponible. Créez d'abord des étudiants dans la section Utilisateurs.
              </div>
            ) : (
              <select
                {...register('studentId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un étudiant</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            )}
            
            {errors.studentId && (
              <p className="text-red-500 text-sm mt-1">{errors.studentId.message}</p>
            )}
          </div>

          {/* Session */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session <span className="text-red-500">*</span>
            </label>
            
            {/* AJOUTEZ UN MESSAGE SI PAS DE SESSIONS */}
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

          {/* Informations sur la session sélectionnée */}
          {selectedSession && selectedCourse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Détails de la session</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-blue-700">Code:</dt>
                  <dd className="font-medium text-blue-900">{selectedCourse.code}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-blue-700">Crédits:</dt>
                  <dd className="font-medium text-blue-900">{selectedCourse.credits || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-blue-700">Période:</dt>
                  <dd className="font-medium text-blue-900">
                    {new Date(selectedSession.startDate).toLocaleDateString('fr-CA')} - {new Date(selectedSession.endDate).toLocaleDateString('fr-CA')}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Avertissement doublon */}
          {isDuplicate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-red-800">
                Cet étudiant est déjà inscrit à cette session.
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isDuplicate || students.length === 0 || sessions.length === 0}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Inscription...' : 'Inscrire'}
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
