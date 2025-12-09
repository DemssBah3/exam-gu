import type  { Course } from '../../types';
import { Pencil, Trash2, BookOpen } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

export const CourseList = ({ courses, onEdit, onDelete, isLoading }: CourseListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun cours trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Crédits</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td>
                <span className="font-mono font-semibold text-blue-600">{course.code}</span>
              </td>
              <td className="font-medium">{course.title}</td>
              <td className="text-gray-600 max-w-xs truncate">
                {course.description || '-'}
              </td>
              <td>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {course.credits || '-'} crédits
                </span>
              </td>
              <td>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer le cours ${course.code} - ${course.title} ?`)) {
                        onDelete(course.id);
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
