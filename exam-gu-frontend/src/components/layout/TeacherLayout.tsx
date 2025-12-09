import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Edit
} from 'lucide-react';

export function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExamsMenuOpen, setIsExamsMenuOpen] = useState(true); // Ouvrir par défaut

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/teacher/dashboard' },
    { icon: BookOpen, label: 'Mes Cours', path: '/teacher/courses' },
  ];

  const examsSubMenu = [
    { icon: List, label: 'Tous les Examens', path: '/teacher/exams' },
    { icon: Plus, label: 'Créer un Examen', path: '/teacher/exams/create' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isExamsSection = location.pathname.startsWith('/teacher/exams');

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ExamGU</h1>
              <p className="text-xs text-gray-500">Enseignant</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ExamGU</h1>
              <p className="text-xs text-gray-500">Enseignant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
            {/* Menu principal */}
            {mainMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* Menu Examens avec sous-menu */}
            <div>
              <button
                onClick={() => setIsExamsMenuOpen(!isExamsMenuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isExamsSection
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span className="font-medium">Mes Examens</span>
                </div>
                {isExamsMenuOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Sous-menu */}
              {isExamsMenuOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                  {examsSubMenu.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

         {/* User Info */}
<div className="border-t border-gray-200 p-4">
  {/* ✅ NOUVEAU: Rendre le profil cliquable */}
  <button
    onClick={() => navigate('/teacher/profile')}
    className="w-full flex items-center gap-3 px-4 py-3 mb-2 hover:bg-red-50 rounded-lg transition-colors group"
  >
    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
      <User className="text-red-600" size={20} />
    </div>
    <div className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600">
        {user?.firstName} {user?.lastName}
      </p>
      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
    </div>
  </button>

  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
  >
    <LogOut size={20} />
    <span className="font-medium">Déconnexion</span>
  </button>
</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
