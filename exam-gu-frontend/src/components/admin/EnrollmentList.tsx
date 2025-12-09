import { useState } from 'react';
import { Trash2, Search, Filter } from 'lucide-react';
import type { Enrollment, User, Session, Course } from '../../types';

interface EnrollmentListProps {
  enrollments: Enrollment[];
  users: User[];
  sessions: Session[];
  courses: Course[];
  onDelete: (id: string) => void;
}

export default function EnrollmentList({
  enrollments,
  users,
  sessions,
  courses,
  onDelete,
}: EnrollmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('');

  // Créer des maps pour un accès rapide
  const userMap = new Map(users.map(u => [u.id, u]));
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  const courseMap = new Map(courses.map(c => [c.id, c]));

  // Enrichir les inscriptions avec les infos complètes
  const enrichedEnrollments = enrollments.map(enrollment => {
    const student = userMap.get(enrollment.studentId);
    const session = sessionMap.get(enrollment.sessionId);
    const course = session ? courseMap.get(session.courseId) : null;

    return {
      ...enrollment,
      student,
      session,
      course,
    };
  });

  // Filtrer les inscriptions
  const filteredEnrollments = enrichedEnrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSession = !filterSession || enrollment.sessionId === filterSession;

    return matchesSearch && matchesSession;
  });

  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Search size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune inscription
        </h3>
        <p className="text-gray-600">
          Commencez par inscrire des étudiants aux sessions de cours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filtres */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par étudiant ou cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les sessions</option>
              {sessions.map(session => {
                const course = courseMap.get(session.courseId);
                return (
                  <option key={session.id} value={session.id}>
                    {course?.code} - {session.semester}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEnrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {enrollment.student?.firstName[0]}{enrollment.student?.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.student?.firstName} {enrollment.student?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.student?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {enrollment.course?.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {enrollment.course?.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {enrollment.session?.semester}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(enrollment.enrolledAt).toLocaleDateString('fr-CA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(enrollment.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Retirer l'inscription"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résultats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Affichage de <span className="font-medium">{filteredEnrollments.length}</span> sur{' '}
          <span className="font-medium">{enrollments.length}</span> inscription(s)
        </p>
      </div>
    </div>
  );
}
