import { createContext, useState, useEffect, } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { tokenUtils } from '../utils/token';
import { authApi } from '../api/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenUtils.getToken();
      
      if (token && !tokenUtils.isTokenExpired(token)) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          tokenUtils.removeToken();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    tokenUtils.setToken(token);
    setUser(userData);
    toast.success(`Bienvenue ${userData.firstName} !`);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenUtils.removeToken();
      setUser(null);
      toast.success('Déconnexion réussie');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
