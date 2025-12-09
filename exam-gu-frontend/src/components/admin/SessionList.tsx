import type  { Session } from '../../types';
import { Pencil, Trash2, Calendar } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  courses: { id: string; code: string; title: string }[];
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  isLoading?: boolean;
}

export const SessionList = ({ sessions, courses, onEdit, onDelete, isLoading }: SessionListProps) => {
  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Cours inconnu';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune session trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Cours</th>
            <th>Semestre</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-gray-50">
              <td className="font-medium">{getCourseName(session.courseId)}</td>
              <td>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {session.semester}
                </span>
              </td>
              <td className="text-gray-600">{formatDate(session.startDate)}</td>
              <td className="text-gray-600">{formatDate(session.endDate)}</td>
              <td>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(session)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer la session ${session.semester} ?`)) {
                        onDelete(session.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
