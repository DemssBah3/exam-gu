import { useState, useEffect } from 'react';
import type  { User, CreateUserRequest, UpdateUserRequest } from '../../types';
import { X, Loader2 } from 'lucide-react';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = ({ user, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT' as 'TEACHER' | 'STUDENT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as 'TEACHER' | 'STUDENT',
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!user && formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (user) {
      // Mode modification (sans password)
      const updateData: UpdateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      onSubmit(updateData);
    } else {
      // Mode création (avec password)
      const createData: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      onSubmit(createData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {user ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="email@uqac.ca"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password (seulement en mode création) */}
          {!user && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Minimum 8 caractères"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className={`input ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="Jean"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className={`input ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Tremblay"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>

          {/* Role (seulement en mode création) */}
          {!user && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="STUDENT">Étudiant</option>
                <option value="TEACHER">Enseignant</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{user ? 'Modifier' : 'Créer'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
