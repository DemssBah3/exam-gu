import { useState } from 'react';
import { Trash2, Search } from 'lucide-react';
import type { CourseAssignment, User, Session, Course } from '../../types';

interface CourseAssignmentListProps {
  assignments: CourseAssignment[];
  users: User[];
  sessions: Session[];
  courses: Course[];
  onDelete: (id: string) => void;
}

export default function CourseAssignmentList({
  assignments,
  users,
  sessions,
  courses,
  onDelete,
}: CourseAssignmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('');

  const userMap = new Map(users.map(u => [u.id, u]));
  const sessionMap = new Map(sessions.map(s => [s.id, s]));
  const courseMap = new Map(courses.map(c => [c.id, c]));

  const enrichedAssignments = assignments.map(assignment => {
    const teacher = userMap.get(assignment.teacherId);
    const session = sessionMap.get(assignment.sessionId);
    const course = session ? courseMap.get(session.courseId) : null;

    return {
      ...assignment,
      teacher,
      session,
      course,
    };
  });

  const filteredAssignments = enrichedAssignments.filter(assignment => {
    const matchesSearch = 
      assignment.teacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSession = !filterSession || assignment.sessionId === filterSession;

    return matchesSearch && matchesSession;
  });

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Search size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune assignation
        </h3>
        <p className="text-gray-600">
          Commencez par assigner des enseignants aux sessions de cours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par enseignant ou cours..."
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enseignant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'assignation
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {assignment.teacher?.firstName[0]}{assignment.teacher?.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.teacher?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.course?.code}
                  </div>
                  <div className="text-sm text-gray-500">
                    {assignment.course?.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {assignment.session?.semester}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(assignment.assignedAt).toLocaleDateString('fr-CA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(assignment.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Retirer l'assignation"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Affichage de <span className="font-medium">{filteredAssignments.length}</span> sur{' '}
          <span className="font-medium">{assignments.length}</span> assignation(s)
        </p>
      </div>
    </div>
  );
}
