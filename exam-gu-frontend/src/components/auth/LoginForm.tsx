import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.token, response.user);
      
      // Redirection selon le rôle
      if (response.user.role === 'ADMIN') {
        navigate('/admin/users');
      } else if (response.user.role === 'TEACHER') {
        navigate('/teacher/exams');
      } else {
        navigate('/student/exams');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  // Comptes de démonstration
  const demoAccounts = [
    { email: 'admin@uqac.ca', role: 'Admin' },
    { email: 'teacher@uqac.ca', role: 'Enseignant' },
    { email: 'student@uqac.ca', role: 'Étudiant' },
  ];

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Exam-GU</h2>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="votre.email@uqac.ca"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">Comptes de démonstration :</p>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => fillDemo(account.email)}
                className="w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-medium">{account.role}</span>
                <span className="text-gray-500"> - {account.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Mot de passe : <code className="bg-gray-100 px-2 py-1 rounded">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
